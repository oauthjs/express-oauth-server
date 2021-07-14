'use strict';

/**
 * Module dependencies.
 */

const ExpressOAuthServer = require('../../');
const InvalidArgumentError = require('oauth2-server/lib/errors/invalid-argument-error');
const NodeOAuthServer = require('oauth2-server');
const bodyparser = require('body-parser');
const express = require('express');
const request = require('supertest');
const should = require('should');
const sinon = require('sinon');

/**
 * Test `ExpressOAuthServer`.
 */

describe('ExpressOAuthServer', function() {

  let app, server;

  beforeEach(function() {
    app = express();
    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({ extended: false }));
  });

  afterEach(function() {
    if(server){
      server.close();
    }
  });

  describe('constructor()', function() {
    it('should throw an error if `model` is missing', function() {
      try {
        new ExpressOAuthServer({});

        should.fail();
      } catch (e) {
        e.should.be.an.instanceOf(InvalidArgumentError);
        e.message.should.equal('Missing parameter: `model`');
      }
    });

    it('should set the `server`', function() {
      let oauth = new ExpressOAuthServer({ model: {} });

      oauth.server.should.be.an.instanceOf(NodeOAuthServer);
    });
  });

  describe('authenticate()', function() {

    it('should return an error if `model` is empty', function(done) {
      let oauth = new ExpressOAuthServer({ model: {} });

      app.use(oauth.authenticate());
      server = app.listen();
      request(server)
        .get('/')
        .end(function(err, res) {
          res.should.have.property('body');
          res.body.should.have.properties([
            'error',
            'error_description'
          ]);
          res.body.error.should.eql('invalid_argument')
          res.body.error_description.should.eql('Invalid argument: model does not implement `getAccessToken()`');
          done();
        });
    });

    it('should authenticate the request', function(done) {
      let tokenExpires = new Date();
      tokenExpires.setDate(tokenExpires.getDate() + 1);

      let token = { user: {}, accessTokenExpiresAt: tokenExpires };
      let model = {
        getAccessToken: function() {
          return token;
        }
      };
      let oauth = new ExpressOAuthServer({ model: model });

      app.use(oauth.authenticate());

      app.use(function(req, res, next) {
        res.send();

        next();
      });

      server = app.listen();
      request(server)
        .get('/')
        .set('Authorization', 'Bearer foobar')
        .expect(200)
        .end(done);
    });

    it('should cache the authorization token', function(done) {
      let tokenExpires = new Date();
      tokenExpires.setDate(tokenExpires.getDate() + 1);
      let token = { user: {}, accessTokenExpiresAt: tokenExpires };
      let model = {
        getAccessToken: function() {
          return token;
        }
      };
      let oauth = new ExpressOAuthServer({ model: model });

      app.use(oauth.authenticate());
      
      let spy = sinon.spy(function(req, res, next) {
        res.locals.oauth.token.should.equal(token);
        res.send(token);
        next();
      });
      app.use(spy);

      server = app.listen();
      request(server)
        .get('/')
        .set('Authorization', 'Bearer foobar')
        .expect(200, function(err, res){
            spy.called.should.be.True();
            done(err);
        });
    });
  });

  describe('authorize()', function() {
    it('should cache the authorization code', function(done) {
      let tokenExpires = new Date();
      tokenExpires.setDate(tokenExpires.getDate() + 1);

      let code = { authorizationCode: 123 };
      let model = {
        getAccessToken: function() {
          return { user: {}, accessTokenExpiresAt: tokenExpires };
        },
        getClient: function() {
          return { grants: ['authorization_code'], redirectUris: ['http://example.com'] };
        },
        saveAuthorizationCode: function() {
          return code;
        }
      };
      let oauth = new ExpressOAuthServer({ model: model, continueMiddleware: true });

      app.use(oauth.authorize());

      let spy = sinon.spy(function(req, res, next) {
        res.locals.oauth.code.should.equal(code);
        next();
      });
      app.use(spy);

      server = app.listen();
      request(server)
        .post('/?state=foobiz')
        .set('Authorization', 'Bearer foobar')
        .send({ client_id: 12345, response_type: 'code' })
        .expect(302, function(err, res){
            spy.called.should.be.True();
            done(err);
        });
    });

    it('should return an error', function(done) {
      let model = {
        getAccessToken: function() {
          return { user: {}, accessTokenExpiresAt: new Date() };
        },
        getClient: function() {
          return { grants: ['authorization_code'], redirectUris: ['http://example.com'] };
        },
        saveAuthorizationCode: function() {
          return {};
        }
      };
      let oauth = new ExpressOAuthServer({ model: model });

      app.use(oauth.authorize());

      server = app.listen();
      request(server)
        .post('/?state=foobiz')
        .set('Authorization', 'Bearer foobar')
        .send({ client_id: 12345 })
        .expect(400, function(err, res) {
          res.body.error.should.eql('invalid_request');
          res.body.error_description.should.eql('Missing parameter: `response_type`');
          done(err);
        });
    });

    it('should return a `location` header with the code', function(done) {
      let model = {
        getAccessToken: function() {
          return { user: {}, accessTokenExpiresAt: new Date() };
        },
        getClient: function() {
          return { grants: ['authorization_code'], redirectUris: ['http://example.com'] };
        },
        saveAuthorizationCode: function() {
          return { authorizationCode: 123 };
        }
      };
      let oauth = new ExpressOAuthServer({ model: model });

      app.use(oauth.authorize());

      server = app.listen();
      request(server)
        .post('/?state=foobiz')
        .set('Authorization', 'Bearer foobar')
        .send({ client_id: 12345, response_type: 'code' })
        .expect('Location', 'http://example.com/?code=123&state=foobiz')
        .end(done);
    });

    it('should return an error if `model` is empty', function(done) {
      let oauth = new ExpressOAuthServer({ model: {} });

      app.use(oauth.authorize());

      server = app.listen();
      request(server)
        .post('/')
        .expect({ error: 'invalid_argument', error_description: 'Invalid argument: model does not implement `getClient()`' })
        .end(done);
    });
  });

  describe('token()', function() {
    it('should cache the authorization token', function(done) {
      let token = { accessToken: 'foobar', client: {}, user: {} };
      let model = {
        getClient: function() {
          return { grants: ['password'] };
        },
        getUser: function() {
          return {};
        },
        saveToken: function() {
          return token;
        }
      };
      let oauth = new ExpressOAuthServer({ model: model, continueMiddleware: true });

      app.use(oauth.token());
      let spy = sinon.spy(function(req, res, next) {
        res.locals.oauth.token.should.equal(token);

        next();
      });
      app.use(spy);

      server = app.listen();
      request(server)
        .post('/')
        .send('client_id=foo&client_secret=bar&grant_type=password&username=qux&password=biz')
        .expect({ access_token: 'foobar', token_type: 'Bearer' })
        .expect(200, function(err, res){
          spy.called.should.be.True();
          done(err);
        });
    });

    it('should return an `access_token`', function(done) {
      let model = {
        getClient: function() {
          return { grants: ['password'] };
        },
        getUser: function() {
          return {};
        },
        saveToken: function() {
          return { accessToken: 'foobar', client: {}, user: {} };
        }
      };
      let spy = sinon.spy();
      let oauth = new ExpressOAuthServer({ model: model, continueMiddleware: true });

      app.use(oauth.token());

      server = app.listen();
      request(server)
        .post('/')
        .send('client_id=foo&client_secret=bar&grant_type=password&username=qux&password=biz')
        .expect({ access_token: 'foobar', token_type: 'Bearer' })
        .end(done);
    });

    it('should return a `refresh_token`', function(done) {
      let model = {
        getClient: function() {
          return { grants: ['password'] };
        },
        getUser: function() {
          return {};
        },
        saveToken: function() {
          return { accessToken: 'foobar', client: {}, refreshToken: 'foobiz', user: {} };
        }
      };
      let oauth = new ExpressOAuthServer({ model: model });

      app.use(oauth.token());

      server = app.listen();
      request(server)
        .post('/')
        .send('client_id=foo&client_secret=bar&grant_type=password&username=qux&password=biz')
        .expect({ access_token: 'foobar', refresh_token: 'foobiz', token_type: 'Bearer' })
        .end(done);
    });

    it('should return an error if `model` is empty', function(done) {
      let oauth = new ExpressOAuthServer({ model: {} });

      app.use(oauth.token());

      server = app.listen();
      request(server)
        .post('/')
        .expect({ error: 'invalid_argument', error_description: 'Invalid argument: model does not implement `getClient()`' })
        .end(done);
    });
  });
});

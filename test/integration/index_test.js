
/**
 * Module dependencies.
 */

var ExpressOAuthServer = require('../../');
var InvalidArgumentError = require('oauth2-server/lib/errors/invalid-argument-error');
var NodeOAuthServer = require('oauth2-server');
var bodyparser = require('body-parser');
var express = require('express');
var request = require('supertest');
var should = require('should');

/**
 * Test `ExpressOAuthServer`.
 */

describe('ExpressOAuthServer', function() {
  var app;

  beforeEach(function() {
    app = express();

    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({ extended: false }));
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
      var oauth = new ExpressOAuthServer({ model: {} });

      oauth.server.should.be.an.instanceOf(NodeOAuthServer);
    });
  });

  describe('authenticate()', function() {
    it('should return an error if `model` is empty', function(done) {
      var oauth = new ExpressOAuthServer({ model: {} });

      app.use(oauth.authenticate());

      request(app.listen())
        .get('/')
        .expect({ error: 'invalid_argument', error_description: 'Invalid argument: model does not implement `getAccessToken()`' })
        .end(done);
    });
  });

  describe('authorize()', function() {
    it('should return a `location` header with the error', function(done) {
      var model = {
        getAccessToken: function() {
          return { user: {} };
        },
        getClient: function() {
          return { grants: ['authorization_code'], redirectUris: ['http://example.com'] };
        },
        saveAuthorizationCode: function() {
          return {};
        }
      };
      var oauth = new ExpressOAuthServer({ model: model });

      app.use(oauth.authorize());

      request(app.listen())
        .post('/?state=foobiz')
        .set('Authorization', 'Bearer foobar')
        .send({ client_id: 12345 })
        .expect('Location', 'http://example.com/?error=invalid_request&error_description=Missing%20parameter%3A%20%60response_type%60&state=foobiz')
        .end(done);
    });

    it('should return a `location` header with the code', function(done) {
      var model = {
        getAccessToken: function() {
          return { user: {} };
        },
        getClient: function() {
          return { grants: ['authorization_code'], redirectUris: ['http://example.com'] };
        },
        saveAuthorizationCode: function() {
          return { authorizationCode: 123 };
        }
      };
      var oauth = new ExpressOAuthServer({ model: model });

      app.use(oauth.authorize());

      request(app.listen())
        .post('/?state=foobiz')
        .set('Authorization', 'Bearer foobar')
        .send({ client_id: 12345, response_type: 'code' })
        .expect('Location', 'http://example.com/?code=123&state=foobiz')
        .end(done);
    });

    it('should return an error if `model` is empty', function(done) {
      var oauth = new ExpressOAuthServer({ model: {} });

      app.use(oauth.authorize());

      request(app)
        .post('/')
        .expect({ error: 'invalid_argument', error_description: 'Invalid argument: model does not implement `getClient()`' })
        .end(done);
    });
  });

  describe('token()', function() {
    it('should return an `access_token`', function(done) {
      var model = {
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
      var oauth = new ExpressOAuthServer({ model: model });

      app.use(oauth.token());

      request(app.listen())
        .post('/')
        .send('client_id=foo&client_secret=bar&grant_type=password&username=qux&password=biz')
        .expect({ access_token: 'foobar', token_type: 'bearer' })
        .end(done);
    });

    it('should return a `refresh_token`', function(done) {
      var model = {
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
      var oauth = new ExpressOAuthServer({ model: model });

      app.use(oauth.token());

      request(app.listen())
        .post('/')
        .send('client_id=foo&client_secret=bar&grant_type=password&username=qux&password=biz')
        .expect({ access_token: 'foobar', refresh_token: 'foobiz', token_type: 'bearer' })
        .end(done);
    });

    it('should return an error if `model` is empty', function(done) {
      var oauth = new ExpressOAuthServer({ model: {} });

      app.use(oauth.token());

      request(app.listen())
        .post('/')
        .expect({ error: 'invalid_argument', error_description: 'Invalid argument: model does not implement `getClient()`' })
        .end(done);
    });
  });
});

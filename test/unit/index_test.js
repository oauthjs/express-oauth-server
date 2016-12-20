'use strict';

/**
 * Module dependencies.
 */

var ExpressOAuthServer = require('../../');
var Request = require('oauth2-server').Request;
var Response = require('oauth2-server').Response;
var express = require('express');
var request = require('supertest');
var sinon = require('sinon');
var should = require('should');

/**
 * Test `ExpressOAuthServer`.
 */

describe('ExpressOAuthServer', function() {
  var app;

  beforeEach(function() {
    app = express();
  });

  describe('authenticate()', function() {
    it('should call `authenticate()`', function(done) {
      var oauth = new ExpressOAuthServer({ model: {} });

      sinon.stub(oauth.server, 'authenticate').returns({});

      app.use(oauth.authenticate());

      request(app.listen())
        .get('/')
        .end(function() {
          oauth.server.authenticate.callCount.should.equal(1);
          oauth.server.authenticate.firstCall.args.should.have.length(3);
          oauth.server.authenticate.firstCall.args[0].should.be.an.instanceOf(Request);
          oauth.server.authenticate.firstCall.args[1].should.be.an.instanceOf(Response);
          should.not.exist(oauth.server.authenticate.firstCall.args[2])
          oauth.server.authenticate.restore();

          done();
        });
    });

    it('should call `authenticate()` with options', function(done) {
      var oauth = new ExpressOAuthServer({ model: {} });

      sinon.stub(oauth.server, 'authenticate').returns({});

      app.use(oauth.authenticate({options: true}));

      request(app.listen())
        .get('/')
        .end(function() {
          oauth.server.authenticate.callCount.should.equal(1);
          oauth.server.authenticate.firstCall.args.should.have.length(3);
          oauth.server.authenticate.firstCall.args[0].should.be.an.instanceOf(Request);
          oauth.server.authenticate.firstCall.args[1].should.be.an.instanceOf(Response);
          oauth.server.authenticate.firstCall.args[2].should.eql({options: true});
          oauth.server.authenticate.restore();
          done();
        });
    });
  });

  describe('authorize()', function() {
    it('should call `authorize()` and end middleware execution', function(done) {
      var nextMiddleware = sinon.spy()
      var oauth = new ExpressOAuthServer({ model: {} });

      sinon.stub(oauth.server, 'authorize').returns({});

      app.use(oauth.authorize());
      app.use(nextMiddleware);

      request(app.listen())
        .get('/')
        .end(function() {
          oauth.server.authorize.callCount.should.equal(1);
          oauth.server.authorize.firstCall.args.should.have.length(3);
          oauth.server.authorize.firstCall.args[0].should.be.an.instanceOf(Request);
          oauth.server.authorize.firstCall.args[1].should.be.an.instanceOf(Response);
          should.not.exist(oauth.server.authorize.firstCall.args[2]);
          oauth.server.authorize.restore();
          nextMiddleware.called.should.be.false();
          done();
        });
    });

    it('should call `authorize()` and continue middleware chain', function(done) {
      var nextMiddleware = sinon.spy()
      var oauth = new ExpressOAuthServer({ model: {}, continueMiddleware: true });

      sinon.stub(oauth.server, 'authorize').returns({});

      app.use(oauth.authorize());
      app.use(nextMiddleware);

      request(app.listen())
        .get('/')
        .end(function() {
          oauth.server.authorize.callCount.should.equal(1);
          oauth.server.authorize.firstCall.args.should.have.length(3);
          oauth.server.authorize.firstCall.args[0].should.be.an.instanceOf(Request);
          oauth.server.authorize.firstCall.args[1].should.be.an.instanceOf(Response);
          should.not.exist(oauth.server.authorize.firstCall.args[2]);
          oauth.server.authorize.restore();
          nextMiddleware.called.should.be.true();
          nextMiddleware.args[0].length.should.eql(3);
          done();
        });
    });

    it('should call `authorize()` with options', function(done) {
      var oauth = new ExpressOAuthServer({ model: {} });

      sinon.stub(oauth.server, 'authorize').returns({});

      app.use(oauth.authorize({options: true}));

      request(app.listen())
        .get('/')
        .end(function() {
          oauth.server.authorize.callCount.should.equal(1);
          oauth.server.authorize.firstCall.args.should.have.length(3);
          oauth.server.authorize.firstCall.args[0].should.be.an.instanceOf(Request);
          oauth.server.authorize.firstCall.args[1].should.be.an.instanceOf(Response);
          oauth.server.authorize.firstCall.args[2].should.eql({options: true});
          oauth.server.authorize.restore();
          done();
        });
    });
  });

  describe('token()', function() {
    it('should call `token()` and end middleware chain', function(done) {
      var nextMiddleware = sinon.spy()
      var oauth = new ExpressOAuthServer({ model: {} });

      sinon.stub(oauth.server, 'token').returns({});

      app.use(oauth.token());
      app.use(nextMiddleware);

      request(app.listen())
        .get('/')
        .end(function() {
          oauth.server.token.callCount.should.equal(1);
          oauth.server.token.firstCall.args.should.have.length(3);
          oauth.server.token.firstCall.args[0].should.be.an.instanceOf(Request);
          oauth.server.token.firstCall.args[1].should.be.an.instanceOf(Response);
          should.not.exist(oauth.server.token.firstCall.args[2]);
          oauth.server.token.restore();
          nextMiddleware.called.should.be.false();
          done();
        });
    });

    it('should call `token()` and continue middleware chain', function(done) {
      var nextMiddleware = sinon.spy()
      var oauth = new ExpressOAuthServer({ model: {}, continueMiddleware: true });

      sinon.stub(oauth.server, 'token').returns({});

      app.use(oauth.token());
      app.use(nextMiddleware);

      request(app.listen())
        .get('/')
        .end(function() {
          oauth.server.token.callCount.should.equal(1);
          oauth.server.token.firstCall.args.should.have.length(3);
          oauth.server.token.firstCall.args[0].should.be.an.instanceOf(Request);
          oauth.server.token.firstCall.args[1].should.be.an.instanceOf(Response);
          should.not.exist(oauth.server.token.firstCall.args[2]);
          oauth.server.token.restore();
          nextMiddleware.called.should.be.true();
          nextMiddleware.args[0].length.should.eql(3);
          done();
        });
    });

    it('should call `token()` with options', function(done) {
      var oauth = new ExpressOAuthServer({ model: {} });

      sinon.stub(oauth.server, 'token').returns({});

      app.use(oauth.token({options: true}));

      request(app.listen())
        .get('/')
        .end(function() {
          oauth.server.token.callCount.should.equal(1);
          oauth.server.token.firstCall.args.should.have.length(3);
          oauth.server.token.firstCall.args[0].should.be.an.instanceOf(Request);
          oauth.server.token.firstCall.args[1].should.be.an.instanceOf(Response);
          oauth.server.token.firstCall.args[2].should.eql({options: true});
          oauth.server.token.restore();
          done();
        });
    });
  });
});

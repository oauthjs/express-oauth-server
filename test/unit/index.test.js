'use strict';

/**
 * Module dependencies.
 */
const ExpressOAuthServer = require('../../');
const Request = require('oauth2-server').Request;
const Response = require('oauth2-server').Response;
const express = require('express');
const request = require('supertest');
const sinon = require('sinon');
const should = require('should');

/**
 * Test `ExpressOAuthServer`.
 */
describe('ExpressOAuthServer', function() {

  let app, server;

  beforeEach(function() {
    app = express();
  });

  afterEach(function() {
    if(server){
      server.close();
    }
  });


  describe('authenticate()', function() {

    it('should call `authenticate()`', function(done) {
      let oauth = new ExpressOAuthServer({ model: {} });

      sinon.stub(oauth.server, 'authenticate')
        .returns( Promise.resolve({}) );

      app.use(oauth.authenticate());

      server = app.listen();
      request(server)
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
      let oauth = new ExpressOAuthServer({ model: {} });

      sinon.stub(oauth.server, 'authenticate')
        .returns( Promise.resolve({}) );

      app.use(oauth.authenticate({options: true}));

      server = app.listen();
      request(server)
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
      let nextMiddleware = sinon.spy()
      let oauth = new ExpressOAuthServer({ model: {} });

      sinon.stub(oauth.server, 'authorize')
        .returns( Promise.resolve({}) );

      app.use(oauth.authorize());
      app.use(nextMiddleware);

      server = app.listen();
      request(server)
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
      let nextMiddleware = sinon.spy()
      let oauth = new ExpressOAuthServer({ model: {}, continueMiddleware: true });

      sinon.stub(oauth.server, 'authorize')
        .returns( Promise.resolve({}) );

      app.use(oauth.authorize());
      app.use(nextMiddleware);

      server = app.listen();
      request(server)
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
      let oauth = new ExpressOAuthServer({ model: {} });

      sinon.stub(oauth.server, 'authorize')
        .returns(Promise.resolve({}));

      app.use(oauth.authorize({options: true}));

      server = app.listen();
      request(server)
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
      let nextMiddleware = sinon.spy()
      let oauth = new ExpressOAuthServer({ model: {} });

      sinon.stub(oauth.server, 'token')
        .returns(Promise.resolve({}));

      app.use(oauth.token());
      app.use(nextMiddleware);

      server = app.listen();
      request(server)
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
      let nextMiddleware = sinon.spy()
      let oauth = new ExpressOAuthServer({ model: {}, continueMiddleware: true });

      sinon.stub(oauth.server, 'token')
        .returns(Promise.resolve({}));

      app.use(oauth.token());
      app.use(nextMiddleware);

      server = app.listen();
      request(server)
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
      let oauth = new ExpressOAuthServer({ model: {} });

      sinon.stub(oauth.server, 'token')
        .returns(Promise.resolve({}));

      app.use(oauth.token({options: true}));

      server = app.listen();
      request(server)
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

/**
 * Module dependencies.
 */

const InvalidArgumentError = require('@node-oauth/oauth2-server/lib/errors/invalid-argument-error');
const NodeOAuthServer = require('@node-oauth/oauth2-server');
const Request = require('@node-oauth/oauth2-server').Request;
const Response = require('@node-oauth/oauth2-server').Response;
const UnauthorizedRequestError = require('@node-oauth/oauth2-server/lib/errors/unauthorized-request-error');

/**
 *
 */
class ExpressOAuthServer {
  /**
   * @constructor
   */
  constructor(options = {}) {
    if (!options.model) {
      throw new InvalidArgumentError('Missing parameter: `model`');
    }

    this.useErrorHandler = !!options.useErrorHandler;
    delete options.useErrorHandler;

    this.continueMiddleware = !!options.continueMiddleware;
    delete options.continueMiddleware;

    this.server = new NodeOAuthServer(options);
  }

}

/**
 * Authentication Middleware.
 *
 * Returns a middleware that will validate a token.
 *
 * (See: https://tools.ietf.org/html/rfc6749#section-7)
 */

ExpressOAuthServer.prototype.authenticate = function(options) {
  const fn = async function(req, res, next) {
    const request = new Request(req);
    const response = new Response(res);

    let token

    try {
      token = await this.server.authenticate(request, response, options);
    } catch (e) {
      return handleError.call(this, e, req, res, null, next);
    }

    res.locals.oauth = { token };
    next();
  };
  return fn.bind(this);
};

/**
 * Authorization Middleware.
 *
 * Returns a middleware that will authorize a client to request tokens.
 *
 * (See: https://tools.ietf.org/html/rfc6749#section-3.1)
 */

ExpressOAuthServer.prototype.authorize = function(options) {
  const fn = async function(req, res, next) {
    const request = new Request(req);
    const response = new Response(res);

    let code

    try {
      code = await this.server.authorize(request, response, options);
    } catch (e) {
      return handleError.call(this, e, req, res, response, next);
    }

    res.locals.oauth = { code: code };
    if (this.continueMiddleware) {
      next();
    }

    return handleResponse.call(this, req, res, response);
  };

  return fn.bind(this);
};

/**
 * Grant Middleware.
 *
 * Returns middleware that will grant tokens to valid requests.
 *
 * (See: https://tools.ietf.org/html/rfc6749#section-3.2)
 */

ExpressOAuthServer.prototype.token = function(options) {
  const fn = async function(req, res, next) {
    const request = new Request(req);
    const response = new Response(res);

    let token

    try {
      token = await this.server.token(request, response, options);
    } catch (e) {
      return handleError.call(this, e, req, res, response, next);
    }

    res.locals.oauth = { token: token };
    if (this.continueMiddleware) {
      next();
    }

    return handleResponse.call(this, req, res, response);
  };

  return fn.bind(this);
};

/**
 * Handle response.
 */
const handleResponse = function(req, res, response) {
  if (response.status === 302) {
    const location = response.headers.location;
    delete response.headers.location;
    res.set(response.headers);
    res.redirect(location);
  } else {
    res.set(response.headers);
    res.status(response.status).send(response.body);
  }
};

/**
 * Handle error.
 */

const handleError = function(e, req, res, response, next) {
  if (this.useErrorHandler === true) {
    next(e);
  } else {
    if (response) {
      res.set(response.headers);
    }

    res.status(e.code);

    if (e instanceof UnauthorizedRequestError) {
      return res.send();
    }

    res.send({ error: e.name, error_description: e.message });
  }
};

/**
 * Export constructor.
 */

module.exports = ExpressOAuthServer;

'use strict';

const NodeOAuthServer = require('oauth2-server');
const {
	Request,
	Response,
	InvalidArgumentError,
	UnauthorizedRequestError,
} = require('oauth2-server');


class ExpressOAuthServer {

	constructor(options = {}) {

		if (!options.model) {
			throw new InvalidArgumentError('Missing parameter: `model`');
		}

		this.useErrorHandler = options.useErrorHandler ? true : false;
		delete options.useErrorHandler;

		this.continueMiddleware = options.continueMiddleware ? true : false;
		delete options.continueMiddleware;

		this.server = new NodeOAuthServer(options);
	}

	/**
	 * Authentication Middleware.
	 *
	 * Returns a middleware that will validate a token.
	 *
	 * (See: https://tools.ietf.org/html/rfc6749#section-7)
	 */
	authenticate(options) {

    console.log('ExpressOAuthServer::authenticate', options);

		return (req, res, next) => {

			const request = new Request(req);
			const response = new Response(res);
			
			return this.server.authenticate(request, response, options)
				.then( (token) => {
					res.locals.oauth = {
						token: token
					};
					return next();
				}) .catch( (err) => {
					return this.errorHandler(err, req, res, null, next);
				});
		};

	}

	/**
	 * Authorization Middleware.
	 *
	 * Returns a middleware that will authorize a client to request tokens.
	 *
	 * (See: https://tools.ietf.org/html/rfc6749#section-3.1)
	 */

	authorize(options) {


		return (req, res, next) => {

			const request = new Request(req);
			const response = new Response(res);

			return this.server.authorize(request, response, options)
				.then( (code) => {
					res.locals.oauth = {
						code: code
					};

					if (this.continueMiddleware) {
						next();
					}
				})
				.then( () => {
					return this.responseHandler(req, res, response);
				})
				.catch( (e) => {
					return this.errorHandler(e, req, res, response, next);
				});
		};
	}

	/**
	 * Grant Middleware.
	 *
	 * Returns middleware that will grant tokens to valid requests.
	 *
	 * (See: https://tools.ietf.org/html/rfc6749#section-3.2)
	 */
	token(options) {

		return (req, res, next) => {

			const request = new Request(req);
			const response = new Response(res);

			return this.server.token(request, response, options)
				.then( (token) => {
					res.locals.oauth = {
						token: token
					};
					if (this.continueMiddleware)
					{
						next();
					}
				})
				.then( () => {
					return this.responseHandler(req, res, response);
				})
				.catch( (e) => {
					return this.errorHandler(e, req, res, response, next);
				});
		};
	}

	/**
	 * Response handler.
	 */
	responseHandler (req, res, response) {

		if (response.status === 302) {
			let location = response.headers.location;
			delete response.headers.location;
			res.set(response.headers);
			return res.redirect(location);
		}
		
		res.set(response.headers);
		res.status(response.status)
			.send(response.body);

	}

	/**
	 * Error handler.
	 */
	errorHandler (error, req, res, response, next) {

		if (this.useErrorHandler === true) {
			return next(error);
		} 

		if (response) {
			res.set(response.headers);
		}

		res.status(error.code);

		if (error instanceof UnauthorizedRequestError) {
			return res.send();
		}

		res.send({
			error: error.name,
			error_description: error.message
		});

	}


}

module.exports = ExpressOAuthServer;
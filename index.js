'use strict';

const NodeOAuthServer = require('oauth2-server');
const {
	Request,
	Response,
	InvalidArgumentError,
	UnauthorizedRequestError,
} = require('oauth2-server');

/**
 * @class ExpressOAuthServer
 * Complete, compliant and well tested module for implementing an OAuth2 
 * Server/Provider with Express in Node.js.
 * 
 * @see https://oauth2-server.readthedocs.io/en/latest/api/oauth2-server.html#new-oauth2server-options
 * @param {Object} options Middleware options
 * @param {Boolean} options.useErrorHandler If false, an error response will be 
 *  rendered by this component. Set this value to true to allow your own express 
 *  error handler to handle the error.
 * @param {Boolean} options.continueMiddleware The `authorize()` and token() 
 *  middlewares will both render their result to the response and end the pipeline. 
 *  `next()` will only be called if this is set to true. Note: You cannot modify the 
 *  response since the headers have already been sent. `authenticate()` does not 
 *  modify the response and will always call `next()`.
 * @param {Object} options.model	a model object through which some aspects of 
 *  storage, retrieval and custom validation are abstracted.
 */
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
   * Authenticates a request.
   * 
   * @method authenticate
   * @see https://oauth2-server.readthedocs.io/en/latest/api/oauth2-server.html#authenticate-request-response-options-callback
   * @param {Object} options	Handler options.
   * @param {String} options.scope	The scope(s) to authenticate.
   * @param {Boolean} options.addAcceptedScopesHeader	Set the X-Accepted-OAuth-Scopes HTTP header on response objects.
   * @param {Boolean} options.addAuthorizedScopesHeader	Set the X-OAuth-Scopes HTTP header on response objects.
   * @param {Boolean} options.allowBearerTokensInQueryString	Allow clients to pass bearer tokens in the query string of a request.
   * @return {Function}
   */
  authenticate(options) {

    
    return (req, res, next) => {
      // console.log('ExpressOAuthServer::authenticate', options);

			const request = new Request(req);
			const response = new Response(res);
      return new Promise( (resolve, reject) => {
          return resolve( this.server.authenticate(request, response, options) );
      })
				.then( (token) => {
					res.locals.oauth = {
						token: token
					};
					return next();
				})
        .catch( (err) => {
					return this.errorHandler(err, req, res, null, next);
				});
		};

	}

  /**
   * Authorizes a token request.
   * 
   * @method authorize
   * @see https://oauth2-server.readthedocs.io/en/latest/api/oauth2-server.html#authorize-request-response-options-callback
   * @param {Object} options	Handler options.
   * @param {{Funtion}} options.authenticateHandler	The authenticate handler.
   * @param {Boolean} options.allowEmptyState	Allow clients to specify an empty state.
   * @param {Number} options.authorizationCodeLifetime	Lifetime of generated authorization codes in seconds (default = 5 minutes).
   * @param {Number} options.accessTokenLifetime	Lifetime of generated implicit grant access token in seconds (default = 1 hr).
   * @return {Function}
   */
   authorize(options) {
    
    return (req, res, next) => {
      // console.log('ExpressOAuthServer::authorize', options);

			const request = new Request(req);
			const response = new Response(res);

      return new Promise( (resolve, reject) => {
			    return resolve(this.server.authorize(request, response, options))
      })
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
				.catch( (err) => {
					return this.errorHandler(err, req, res, response, next);
				});
		};
	}

  /**
   * Retrieves a new token for an authorized token request.
   * 
   * @method token
   * @see https://oauth2-server.readthedocs.io/en/latest/api/oauth2-server.html#token-request-response-options-callback
   * @param {Object} options	Handler options.
   * @param {	Number} options.accessTokenLifetime	Lifetime of generated access tokens in seconds (default = 1 hour).
   * @param {	Number} options.refreshTokenLifetime	Lifetime of generated refresh tokens in seconds (default = 2 weeks).
   * @param {	Boolean} options.allowExtendedTokenAttributes	Allow extended attributes to be set on the returned token.
   * @param {Object} options.requireClientAuthentication	Require a client secret. Defaults to true for all grant types.
   * @param {	Boolean} options.alwaysIssueNewRefreshToken	Always revoke the used refresh token and issue a new one for the refresh_token grant.
   * @param {Object} options.extendedGrantTypes	Additional supported grant types.
   * @return {Function}
   */
   token(options) {

		return (req, res, next) => {

			const request = new Request(req);
			const response = new Response(res);
      
      return new Promise( (resolve, reject) => {
			    return resolve(this.server.token(request, response, options))
      })
				.then( (token) => {
					res.locals.oauth = {
						token: token
					};
					if (this.continueMiddleware) {
						next();
					}
				})
				.then( () => {
					return this.responseHandler(req, res, response);
				})
				.catch( (err) => {
					return this.errorHandler(err, req, res, response, next);
				});
		};
	}

	/**
	 * Response handler.
   * 
   * @method responseHandler
   * @private
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
   * 
   * @method errorHandler
   * @private
	 */
	errorHandler (error, req, res, response, next) {

    // console.log('ExpressOAuthServer::errorHandler', error);

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

/**
 * Module dependencies.
 */

var db = require('bluebird').promisify(require('redis').createClient());
var fmt = require('util').format;

/**
 * Redis formats.
 */

var formats = {
  client: 'clients:%s',
  token: 'tokens:%s',
  user: 'users:%s'
};

/**
 * Get access token.
 */

module.exports.getAccessToken = function(bearerToken) {
  return db.hgetall(fmt(formats.token, bearerToken))
    .then(function(token) {
      if (!token) {
        return;
      }

      return {
        accessToken: token.accessToken,
        clientId: token.clientId,
        expires: token.accessTokenExpiresOn,
        userId: token.userId
      };
    });
};

/**
 * Get client.
 */

module.exports.getClient = function(clientId, clientSecret) {
  return db.hgetall(fmt(formats.client, clientId))
    .then(function(client) {
      if (!client || client.clientSecret !== clientSecret) {
        return;
      }

      return {
        clientId: client.clientId,
        clientSecret: client.clientSecret
      };
    });
};

/**
 * Get refresh token.
 */

module.exports.getRefreshToken = function(bearerToken) {
  return db.hgetall(fmt(formats.token, bearerToken))
    .then(function(token) {
      if (!token) {
        return;
      }

      return {
        clientId: token.clientId,
        expires: token.refreshTokenExpiresOn,
        refreshToken: token.accessToken,
        userId: token.userId
      };
    });
};

/**
 * Get user.
 */

module.exports.getUser = function(username, password) {
  return db.hgetall(fmt(formats.user, username))
    .then(function(user) {
      if (!user || password !== user.password) {
        return;
      }

      return {
        id: username
      };
    });
};

/**
 * Save token.
 */

module.exports.saveToken = function(token, client, user) {
  var data = {
    accessToken: token.accessToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    clientId: client.id,
    refreshToken: token.refreshToken,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
    userId: user.id
  };

  return Promise.all([
    db.hmset(fmt(formats.token, token.accessToken), data),
    db.hmset(fmt(formats.token, token.refreshToken), data)
  ]).return(data);
};

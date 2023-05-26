# Express OAuth Server 

Complete, compliant and well tested module for implementing an OAuth2 Server/Provider with [express](https://github.com/expressjs/express) in [node.js](http://nodejs.org/).

[![Tests](https://github.com/node-oauth/express-oauth-server/actions/workflows/tests.yml/badge.svg)](https://github.com/node-oauth/express-oauth-server/actions/workflows/tests.yml)
[![CodeQL](https://github.com/node-oauth/express-oauth-server/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/node-oauth/express-oauth-server/actions/workflows/github-code-scanning/codeql)
![GitHub](https://img.shields.io/github/license/node-oauth/express-oauth-server)


This is the express wrapper for [@node-oauth/oauth2-server](https://github.com/node-oauth/node-oauth2-server),
it's a fork from the former [oauthjs/express-oauth-server](https://github.com/oauthjs/express-oauth-server).

## Installation

```shell
$ npm install @node-oauth/express-oauth-server
```

## Quick Start

The module provides two middlewares - one for granting tokens and another to authorize them. 
`@node-oauth/express-oauth-server` and, consequently `@node-oauth/oauth2-server`,
expect the request body to be parsed already.
The following example uses `body-parser` but you may opt for an alternative library.

```js
var bodyParser = require('body-parser');
var express = require('express');
var OAuthServer = require('@node-oauth/express-oauth-server');

var app = express();

app.oauth = new OAuthServer({
  model: {}, // See https://github.com/node-oauth/node-oauth2-server for specification
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(app.oauth.authorize());

app.use(function(req, res) {
  res.send('Secret area');
});

app.listen(3000);
```

## Options

```
var options = { 
  useErrorHandler: false, 
  continueMiddleware: false,
}
```
* `useErrorHandler`
(_type: boolean_ default: false)

  If false, an error response will be rendered by this component.
  Set this value to true to allow your own express error handler to handle the error.

* `continueMiddleware`
(_type: boolean default: false_)

  The `authorize()` and `token()` middlewares will both render their 
  result to the response and end the pipeline.
  next() will only be called if this is set to true.

  **Note:** You cannot modify the response since the headers have already been sent.

  `authenticate()` does not modify the response and will always call next()

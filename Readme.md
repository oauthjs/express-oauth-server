# Express OAuth Server [![Build Status](https://travis-ci.org/seegno/express-oauth-server.png?branch=master)](https://travis-ci.org/seegno/express-oauth-server)

Complete, compliant and well tested module for implementing an OAuth2 Server/Provider with [express](https://github.com/strongloop/express) in [node.js](http://nodejs.org/).

This is the express wrapper for [oauth2-server](https://github.com/thomseddon/node-oauth2-server).

## Installation

    $ npm install express-oauth-server

## Quick Start

The module provides two middlewares - one for granting tokens and another to authorise them. `express-oauth-server` and, consequently `oauth2-server`, expect the request body to be parsed already.
The following example uses `body-parser` but you may opt for an alternative library.

```js
var bodyparser = require('body-parser');
var express = require('express');
var oauthserver = require('express-oauth-server');

var app = express();

app.oauth = oauthserver({
  model: {}, // See https://github.com/thomseddon/node-oauth2-server for specification
});

app.use(bodyParser.json());
app.use(bodyparser.urlencoded({ extended: false }))
app.use(app.oauth.authorise());

app.use(function(req, res) {
  res.send('Secret area');
});

app.listen(3000);
```

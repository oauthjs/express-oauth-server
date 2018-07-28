# In-Memory Example

## DO NOT USE THIS EXAMPLE IN PRODUCTION

The object exposed in model.js could be directly passed into the model parameter of the config object when initiating.

For example:

```js
var express = require('express');
var OAuthServer = require('express-oauth-server');

var app = express();

app.oauth = new OAuthServer({
  debug: true,
  // See https://github.com/oauthjs/node-oauth2-server for specification
  model: require('./model')
});
```

# Dump

You can also dump the contents of the memory store (for debugging) like so:

```js
memorystore.dump();
```

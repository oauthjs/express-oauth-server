# In-Memory Example

## DO NOT USE THIS EXAMPLE IN PRODUCTION

The object exposed in model.js could be directly passed into the model parameter of the config object when initiating.

For example:

```js
var bodyParser = require('body-parser');
var express = require('express');
var OAuthServer = require('express-oauth-server');

var app = express();

app.oauth = new OAuthServer({
  debug: true,
  // See https://github.com/oauthjs/node-oauth2-server for specification
  model: require('./model')
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(app.oauth.authorize());

app.use(function(req, res) {
  res.send('Secret area');
});

app.listen(3000);
```

# Dump

You can also dump the contents of the memory store (for debugging) like so:

```js
memorystore.dump();
```

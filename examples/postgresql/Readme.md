# PostgreSQL Example

The object exposed in model.js could be directly passed into the model parameter of the config object when initiating.

See schema.sql for the tables referred to in this example.

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

## Note

In this example, the postgres connection info is read from the `DATABASE_URL` environment variable which you can set when you run, for example:

```
$ DATABASE_URL=postgres://postgres:1234@localhost/postgres node index.js
```

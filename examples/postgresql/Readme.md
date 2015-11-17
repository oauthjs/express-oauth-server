# PostgreSQL Example

The object exposed in model.js could be directly passed into the model parameter of the config object when initiating.

See schema.sql for the tables referred to in this example.

For example:

```js
var oauth = oauthserver({
  debug: true,
  model: require('./model')
});
```

## Note

In this example, the postgres connection info is read from the `DATABASE_URL` environment variable which you can set when you run, for example:

```
$ DATABASE_URL=postgres://postgres:1234@localhost/postgres node index.js
```

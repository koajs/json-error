# Koa JSON Error
Error handler for pure JSON open-source apps where showing the stack trace is cool!

## API

```js
var error = require('koa-json-error')
var app = koa()

app.use(error())
```

You can customize which properties will be shown on your error messages by overriding default options with `options.omit` and `options.include`.

Default properties are `'name'`, `'message'`, `'stack',` and `'type'`.

```js
var error = require('koa-json-error')
var app = koa()

// Avoid including the stack trace on
// production environment
if (process.env.NODE_ENV === 'production') {
  app.use(error({ omit: 'stack' }))
} else {
  app.use(error())
}
```

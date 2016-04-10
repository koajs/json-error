
# Koa JSON Error

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

Error handler for pure JSON open-source apps where showing the stack trace is cool!

## API

```js
var error = require('koa-json-error')

app.use(error())
```

### Advanced usage
You may pass in an `options` object as argument to the middleware. These are the available settings.

#### `options.format(Function)`
If you don't really feel that showing the stack trace is _that_ cool, you can customize the way errors are shown on responses through a formatter function. It receives the raw error object and it is expected to return the formatted response.

```js
'use strict';
var koa = require('koa');
var error = require('koa-json-error');

var options = {
  format: function(err) {
    return {
      status: 200,
      message: err.message || 'OK';
    }
  }
}
var app = koa();
app.use(error(options));
```

> Modifying the error inside the `format` function will mutate the original object.

[npm-image]: https://img.shields.io/npm/v/koa-json-error.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-json-error
[travis-image]: https://img.shields.io/travis/koajs/json-error/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/koajs/json-error
[codecov-image]: https://img.shields.io/codecov/c/github/koajs/json-error/master.svg?style=flat-square
[codecov-url]: https://codecov.io/github/koajs/json-error
[david-image]: http://img.shields.io/david/koajs/json-error.svg?style=flat-square
[david-url]: https://david-dm.org/koajs/json-error
[license-image]: http://img.shields.io/npm/l/koa-json-error.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/koa-json-error.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/koa-json-error

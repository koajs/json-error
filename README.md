# Koa JSON Error

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

Error handler for pure [Koa](https://koajs.com) 2.0.0+ JSON apps where showing the stack trace is _cool!_

```sh
npm install --save koa-json-error
```

Versions 3.0.0 and up support Koa 2.0.0+. For earlier versions of Koa, _please use previous releases_.

## Requirements
- node `>=4.0.0`
- koa `>=2.0.0`

> Starting from `koa-json-error@2.0.0`, this package supports node `>4.0.0` _only_. If you need to use the handler on a project running on node `0.12` or less, please use `1.0.1`.


## API

```js
'use strict';
const koa = require('koa');
const error = require('koa-json-error')

let app = new Koa();
app.use(error())
```

### Advanced usage
If you don't really feel that showing the stack trace is _that_ cool, you can customize the way errors are shown on responses through a series of formatter functions. They receive the raw error object and return a formatted response. This gives you fine-grained control over the final output and allows for different formats on various environments.

You may pass in an `options` object as argument to the middleware. These are the available settings.

#### `options.preFormat (Function)`
Perform some task before calling `options.format`. Must be a function with the original `err` as its only argument.

Defaults to:

```javascript
err => _.assign({}, err) // lodash _.assign
```

Which sets all enumerable properties of `err` onto the formatted object.

#### `options.format (Function)`
Runs inmediatly after `options.preFormat`. It receives two arguments: the original `err` and the output of `options.preFormat`. It should `return` a newly formatted error.

Defaults to adding the following non-enumerable properties to the output:

```javascript
const DEFAULT_PROPERTIES = [
  'name',
  'message',
  'stack',
  'type',
  'status'
];
```

#### `options.postFormat (Function)`
Runs inmediatly after `options.format`. It receives two arguments: the original `err` and the output of `options.format`. It should `return` a newly formatted error.

The default is a no-op (final output is defined by `options.format`).

This option is useful when you want to preserve the default functionality and extend it in some way.

For example,
```javascript
'use strict';
const _ = require('lodash');
const koa = require('koa');
const error = require('koa-json-error')

let options = {
    // Avoid showing the stacktrace in 'production' env
    postFormat: (e, obj) => process.env.NODE_ENV === 'production' ? _.omit(obj, 'stack') : obj
};
let app = new Koa();
app.use(error(options));
```

> Modifying the error inside the `*format` functions will mutate the original object. Be aware of that if any other Koa middleware runs after this one.

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

# Koa JSON Error

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

Error handler for pure [Koa](https://koajs.com) `>=2.0.0` JSON apps where showing the stack trace is _cool!_

```sh
npm install --save koa-json-error
```

> Versions `>=3.0.0` support Koa `^2.0.0`. For earlier versions of Koa, _please use previous releases_.

## Requirements
- node `>=6.0.0`
- koa `>=2.2.0`

> Starting from `3.2.0`, this package supports node `>=6.0.0` to match [Koa requirements][koa-requirements].


## API

```js
'use strict';
const koa = require('koa');
const error = require('koa-json-error')

let app = new Koa();
app.use(error())
```

If you don't really feel that showing the stack trace is _that_ cool, you can customize the way errors are shown on responses. There's a **basic** and more **advanced**, granular approach to this.

### Basic usage
You can provide a _single formatter function_ as an argument on middleware initialization. It receives the original raised error and it is expected to return a formatted response.

Here's a simple example:

```js
'use strict';
const koa = require('koa');
const error = require('koa-json-error')

function formatError(err) {
    return {
        // Copy some attributes from
        // the original error
        status: err.status,
        message: err.message,

        // ...or add some custom ones
        success: false,
        reason: 'Unexpected'
    }
}

let app = new Koa();
app.use(error(formatError));
```

This basic configuration is essentially the same (and serves as a shorthand for) the following:

```js
'use strict';
let app = new Koa();
app.use(error({
    preFormat: null,
    format: formatError
}));
```

See section below.

### Advanced usage
You can also customize errors on responses through a series of _three formatter functions_, specified in an `options` object. They receive the raw error object and return a formatted response. This gives you fine-grained control over the final output and allows for different formats on various environments.

You may pass in the `options` object as argument to the middleware. These are the available settings.

#### `options.preFormat (Function)`
Perform some task before calling `options.format`. Must be a function with the original `err` as its only argument.

Defaults to:

```js
(err) => Object.assign({}, err)
```

Which sets all enumerable properties of `err` onto the formatted object.

#### `options.format (Function)`
Runs inmediatly after `options.preFormat`. It receives two arguments: the original `err` and the output of `options.preFormat`. It should `return` a newly formatted error.

Defaults to adding the following non-enumerable properties to the output:

```js
const DEFAULT_PROPERTIES = [
  'name',
  'message',
  'stack',
  'type'
];
```

It also defines a `status` property like so:

```js
obj.status = err.status || err.statusCode || 500;
```

#### `options.postFormat (Function)`
Runs inmediatly after `options.format`. It receives two arguments: the original `err` and the output of `options.format`. It should `return` a newly formatted error.

The default is a no-op (final output is defined by `options.format`).

This option is useful when you want to preserve the default functionality and extend it in some way.

For example,
```js
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
[koa-requirements]: https://github.com/koajs/koa/blob/master/package.json#L61


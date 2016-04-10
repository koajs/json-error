'use strict';
/**
 * Error handler for pure-JSON Koa 2.0.0+ apps.
 *
 *```
 * const Koa = require('koa');
 * const error = require('koa-json-error')
 *
 * let app = new Koa();
 * app.use(error());
 *```
 *
 * @module koa-json-error
 */
const defaults = require('lodash.defaults');
const assign = require('lodash.assign');

/**
 * Name of default attributes shown on errors.
 * This attributes can be customized by setting a
 * `format` function during middleware declaration.
 * @type {Array}
 */
const DEFAULT_PROPERTIES = [
  'name',
  'message',
  'stack',
  'type'
];

/**
 * Default middleware configuration values.
 * @type {Object}
 */
const DEFAULTS = {
  format: function(err) {
    // set all enumerable properties of error onto the object
    let obj = assign({}, err);
    DEFAULT_PROPERTIES.forEach(key => {
      let value = err[key];
      if (value) obj[key] = value;
    });

    obj.status = err.status || err.statusCode || 500;

    return obj;
  }
};

module.exports = function(options) {
  options = defaults({}, options, DEFAULTS);

  return (ctx, next) => {
    let status;
    return next()
      .then(() => {
        status = ctx.status;
        // future proof status
        if (!status || (status === 404 && ctx.body == null)) {
          ctx.throw(404);
        }
      })
      .catch(err => {
        // set body
        ctx.body = options.format(err) || {};

        // set status
        status =
          ctx.status = err.status || err.statusCode || 500;

        // emit the error if we really care
        if (!err.expose && status >= 500) {
          ctx.app.emit('error', err, ctx);
        }
      });
  };
};

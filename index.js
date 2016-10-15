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
const compact = require('lodash.compact');

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
  // Set all enumerable properties of error onto the object
  preFormat: err => Object.assign({}, err),
  // Add default custom properties to final error object
  format: function(err, obj) {
    DEFAULT_PROPERTIES.forEach(key => {
      let value = err[key];
      if (value) {
        obj[key] = value;
      }
    });

    obj.status = err.status || err.statusCode || 500;

    return obj;
  },
  // Final transformation after `options.format` (defaults to no op)
  postFormat: null
};

module.exports = function(options) {
  if (typeof options === 'function') {
    // If a function is passed as an argument, treat it
    // like a `format` function, with no `preFormat`.
    options = {
      preFormat: null,
      format: options
    };
  }

  // Extend options with default values
  options = defaults({}, options, DEFAULTS);

  const FORMATTER = compact([options.preFormat, options.format, options.postFormat]);

  /**
   * Apply all ordered formatting functions to original error.
   * @param  {Error} err The thrown error.
   * @return {Object}    The serializable formatted object.
   */
  function formatError(err) {
    let res = {};
    FORMATTER.forEach(f => res = f(err, res));
    return res;
  }

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
        // Format and set body
        ctx.body = formatError(err) || {};
        // Set status
        status =
          ctx.status = err.status || err.statusCode || 500;
        // Emit the error if we really care
        if (!err.expose && status >= 500) {
          ctx.app.emit('error', err, ctx);
        }
      });
  };
};

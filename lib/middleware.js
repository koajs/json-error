'use strict';
/**
 * Main json-error middleware factory function.
 * @module lib/middleware
 */
const compact = require('lodash.compact');
const curry = require('lodash.curry');
const { DEFAULT_FORMATTING_PIPELINE } = require('./defaults');

module.exports = function createJsonErrorMiddleware(options) {
  if (typeof options === 'function') {
    // If a function is passed as an argument, treat it
    // like a `format` function, with no `preFormat`.
    options = {
      preFormat: null,
      format: options
    };
  }

  // Extend options with default values
  const formatters = Object.assign({}, DEFAULT_FORMATTING_PIPELINE, options);

  const formattingPipeline = compact([
    formatters.preFormat,
    formatters.format,
    formatters.postFormat
  ]);

  const applyFormat = curry((err, acum, formatter) => formatter(err, acum));

  /**
   * Apply all ordered formatting functions to original error.
   * @param  {Error} err The thrown error.
   * @return {Object}    The JSON serializable formatted object.
   */
  const formatError = err => {
    return formattingPipeline.reduce(applyFormat(err), {});
  };

  const shouldThrow404 = (status, body) => {
    return !status || (status === 404 && body == null);
  };

  const shouldEmitError = (err, status) => {
    return !err.expose && status >= 500;
  };

  return function jsonError(ctx, next) {
    return next()
      .then(() => {
        // future proof status
        shouldThrow404(ctx.status, ctx.body) && ctx.throw(404);
      })
      .catch(err => {
        // Format and set body
        ctx.body = formatError(err) || {};
        // Set status
        ctx.status = err.status || err.statusCode || 500;
        // Emit the error if we really care
        shouldEmitError(err, ctx.status) && ctx.app.emit('error', err, ctx);
      });
  };
};

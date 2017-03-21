'use strict';
/**
 * Declare and export default values for middleware options.
 * @module lib/defaults
 */
const curry = require('lodash.curry');

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
 * A pure curried reducer iteratee that builds a new object with properties
 * named after the elements of the collection being reduced only if that
 * property is also present in `err`.
 * @param {Object} err   The original raised error being handled.
 * @param {Object} acum  The reducer's acumulator.
 * @param {String} propertyName  Name of the new property to add to the acumulator.
 * @return {Object}       A new object with all of properties in `acum` as well
 *                          as `err[propertyName]`, if `propertyName` is an
 *                          enumerable property of `err`.
 */
const toErrorObject = curry((err, acum, propertyName) => {
  return err[propertyName] ? Object.assign({}, acum, {
    [propertyName]: err[propertyName]
  }) : acum;
});

/**
 * Default middleware configuration values.
 * @type {Object}
 */
const DEFAULT_FORMATTING_PIPELINE = Object.freeze({
  // Set all enumerable properties of error onto the object
  preFormat: err => Object.assign({}, err),
  // Add default custom properties to final error object
  format: function(err, preFormattedError) {
    const formattedError = DEFAULT_PROPERTIES.reduce(toErrorObject(err), {});
    return Object.assign({}, preFormattedError, formattedError, {
      status: err.status || err.statusCode || 500
    });
  },
  // Final transformation after `options.format` (defaults to no op)
  postFormat: null
});

// Module API
module.exports = {
  DEFAULT_PROPERTIES,
  DEFAULT_FORMATTING_PIPELINE
};

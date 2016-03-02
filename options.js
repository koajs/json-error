'use strict';

/**
 * Default property names included in json
 * error responses.
 */
const DEFAULT_PROPERTIES = [
  'name',
  'message',
  'stack',
  'type'
]

// Module API
module.exports = {
  from
}

/**
 * Returns a deep copy of `value`.
 *
 * @param value {*} value The value to clone.
 * @returns {*} Returns the cloned value.
 */
function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

/**
 * Casts `value` as an array if it's not one.
 *
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast array.
 */
function castArray(value) {
  return value !== null && value.constructor === Array ? value : [value]
}

/**
 * Creates a configuration object based on `opts`.
 * Adds sensible defaults and missing properties
 * if necessary.
 *
 * @param {Object} The options to inspect.
 * @returns {Object} Complete options object.
 */
function from(opts) {
  var options = clone(opts || {});
  options.include = castArray(options.include || DEFAULT_PROPERTIES.slice())
  options.omit = castArray(options.omit || [])
  options.properties = options.include.filter(function(i) {
    return !(~options.omit.indexOf(i))
  })
  return options
}


var defaults = require('lodash.defaults');

var props = [
  'name',
  'message',
  'stack',
  'type',
]

var DEFAULTS = {
  format: function(err) {
    var obj = {}

    // set all enumerable properties of error onto the object
    Object.keys(err).forEach(function (key) {
      obj[key] = err[key]
    })
    props.forEach(function (key) {
      var value = err[key]
      if (value) obj[key] = value
    })

    obj.status = err.status || err.statusCode || 500

    return obj
  }
}

module.exports = function (options) {
  options = defaults({}, options, DEFAULTS);

  return function* jsonErrorHandler(next) {
    var status
    try {
      yield* next

      status = this.response.status
      // future proof status
      if (!status || (status === 404 && this.response.body == null)) this.throw(404)
    } catch (err) {
      // set body
      this.response.body = options.format(err) || {};

      // set status
      status =
      this.response.status =
      err.status || err.statusCode || 500

      // emit the error if we really care
      if (!err.expose && status >= 500) this.app.emit('error', err, this)
    }
  }
}

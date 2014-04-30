
var props = [
  'name',
  'message',
  'stack',
  'type',
]

module.exports = function () {
  return function* jsonErrorHandler(next) {
    var status
    try {
      yield* next
      status = this.response.status
      if (!status || (status === 404 && this.response.body == null)) this.throw(404)
    } catch (err) {
      var obj = this.response.body = {}
      this.response.status = err.status = err.status || 500
      Object.keys(err).forEach(function (key) {
        obj[key] = err[key]
      })
      props.forEach(function (key) {
        var value = err[key]
        if (value) obj[key] = value
      })
      if (!err.expose && status >= 500) this.app.emit('error', err, this)
    }
  }
}

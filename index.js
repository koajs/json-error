var defaultProps = [
  'name',
  'message',
  'stack',
  'type'
];

module.exports = function (propertiesToShow) {

  var props = propertiesToShow || defaultProps;

  return function* jsonErrorHandler(next) {
    var status;
    try {
      yield* next;

      status = this.response.status;
      // future proof status
      if (!status || (status === 404 && this.response.body == null)) {
        this.throw(404)
      }
    } catch (err) {
      // set body
      var obj = this.response.body = {};

      // set status
      status = this.response.status = err.status = err.status || 500;

      // set all properties of error onto the object
      Object.keys(err).forEach(function (key) {
        obj[key] = err[key];
      });
      props.forEach(function (key) {
        var value = err[key];
        if (value) {
          obj[key] = value;
        }
      });

      // emit the error if we really care
      if (!err.expose && status >= 500) {
        this.app.emit('error', err, this)
      }
    }
  }
};

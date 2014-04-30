
var koa = require('koa')
var request = require('supertest')

var error = require('./')

it('should show the stack', function (done) {
  var app = koa()
  app.use(error())
  app.use(function* () {
    throw new Error()
  })
  request(app.listen())
  .get('/')
  .expect(500, function (err, res) {
    if (err) return done(err)
    res.body.stack.should.be.ok
    done()
  })
})

it('should show the name', function (done) {
  var app = koa()
  app.use(error())
  app.use(function* () {
    throw new Error()
  })
  request(app.listen())
  .get('/')
  .expect(500, function (err, res) {
    if (err) return done(err)
    res.body.name.should.equal('Error')
    done()
  })
})

it('should show the message', function (done) {
  var app = koa()
  app.use(error())
  app.use(function* () {
    throw new Error('boom')
  })
  request(app.listen())
  .get('/')
  .expect(500, function (err, res) {
    if (err) return done(err)
    res.body.message.should.equal('boom')
    done()
  })
})

it('should show the status', function (done) {
  var app = koa()
  app.use(error())
  app.use(function* () {
    this.throw(404)
  })
  request(app.listen())
  .get('/')
  .expect(404, function (err, res) {
    if (err) return done(err)
    res.body.message.should.equal('Not Found')
    res.body.status.should.equal(404)
    done()
  })
})

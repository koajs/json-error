
var request = require('supertest')
var assert = require('assert')
var koa = require('koa')

var error = require('..')

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

    assert(res.body)
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

    assert.equal('Error', res.body.name)
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

    assert.equal('boom', res.body.message)
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

    assert.equal('Not Found', res.body.message)
    assert.equal(404, res.body.status)
    done()
  })
})

it('should emit errors', function (done) {
  var app = koa()
  app.use(error())
  app.use(function* () {
    throw new Error('boom')
  })

  app.once('error', function (err) {
    assert.equal('boom', err.message)
    assert.equal(500, err.status)

    done()
  })

  request(app.listen())
  .get('/')
  .expect(500, function () {})
})

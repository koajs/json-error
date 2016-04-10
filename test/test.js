'use strict';
var request = require('supertest')
var assert = require('assert')
var koa = require('koa')

var error = require('..')

describe('with default options', function () {
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

  it('should check for err.statusCode', function (done) {
    var app = koa()
    app.use(error())
    app.use(function* () {
      var err = new Error('boom')
      err.statusCode = 501
      throw err
    })

    request(app.listen())
    .get('/')
    .expect(501, done)
  })

  it('should emit errors', function (done) {
    var app = koa()
    app.use(error())
    app.use(function* () {
      throw new Error('boom')
    })

    app.once('error', function (err, ctx) {
      assert.equal('boom', err.message)
      assert.equal(500, ctx.status)
      done()
    })

    request(app.listen())
    .get('/')
    .expect(500, function () {})
  })
})

describe('with custom format function', function() {
  it('should allow defining a format function', function () {
    var options = {
      format: Function.prototype
    }

    var app = koa()
    assert.doesNotThrow(function () {
      app.use(error(options))
    })
  })

  it('should respect custom format while preserving status', function(done) {
    var options = {
      format: function(err) {
        return {
          status: 200,
          message: 'OK'
        }
      }
    }

    var app = koa()
    app.use(error(options))
    app.use(function* () {
      var err = new Error('boom')
      err.statusCode = 501
      err.customField = 'fatal'
      throw err
    })

    request(app.listen())
    .get('/')
    .expect(501, function (err, res) {
      if (err) return done(err)

      assert.equal('OK', res.body.message)
      assert.equal(200, res.body.status)
      done()
    })
  })
})

'use strict';

var should = require('should')
var koa = require('koa')
var request = require('supertest')
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
    res.body.stack.should.be.ok
    return done()
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
    return done()
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
    return done()
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
    return done()
  })
})

it('should emit errors', function (done) {
  var app = koa()
  app.use(error())
  app.use(function* () {
    throw new Error('boom')
  })

  app.once('error', function (err) {
    err.message.should.equal('boom')
    err.status.should.equal(500)
    return done()
  })

  request(app.listen())
  .get('/')
  .expect(500, function () {})
})

it('should omit properties', function (done) {
  var app = koa()
  app.use(error({ omit: 'stack' }))
  app.use(function* () {
    throw new Error('boom')
  })

  request(app.listen())
  .get('/')
  .expect(500, function (err, res) {
    if (err) return done(err)
    res.body.message.should.equal('boom')
    res.body.status.should.equal(500)
    should(res.body.stack).be.undefined
    return done()
  })
})

it('should include properties', function (done) {
  var app = koa()
  app.use(error({ include: 'stack' }))
  app.use(function* () {
    throw new Error('boom')
  })

  request(app.listen())
  .get('/')
  .expect(500, function (err, res) {
    if (err) return done(err)
    res.body.status.should.equal(500)
    res.body.stack.should.be.ok
    should(res.body.name).be.undefined
    should(res.body.message).be.undefined
    should(res.body.type).be.undefined
    return done()
  })
})

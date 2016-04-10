'use strict';
const request = require('supertest');
const assert = require('assert');
const Koa = require('koa');

const error = require('..');

describe('with default options', () => {
  it('should show the stack', done => {
    let app = new Koa();
    app.use(error());
    app.use(() => {
      throw new Error();
    });
    request(app.listen())
    .get('/')
    .expect(500, (err, res) => {
      if (err) return done(err);

      assert(res.body);
      return done();
    });
  });

  it('should show the name', done => {
    let app = new Koa();
    app.use(error());
    app.use(() => {
      throw new Error();
    });
    request(app.listen())
    .get('/')
    .expect(500, (err, res) => {
      if (err) return done(err);

      assert.equal('Error', res.body.name);
      return done();
    });
  });

  it('should show the message', done => {
    let app = new Koa();
    app.use(error());
    app.use(() => {
      throw new Error('boom');
    });
    request(app.listen())
    .get('/')
    .expect(500, (err, res) => {
      if (err) {
        return done(err);
      }
      assert.equal('boom', res.body.message);
      return done();
    });
  });

  it('should show the status', done => {
    let app = new Koa();
    app.use(error());
    app.use(ctx => {
      ctx.throw(404);
    });
    request(app.listen())
    .get('/')
    .expect(404, (err, res) => {
      if (err) {
        return done(err);
      }
      assert.equal('Not Found', res.body.message);
      assert.equal(404, res.body.status);
      return done();
    });
  });

  it('should check for err.statusCode', done => {
    let app = new Koa();
    app.use(error());
    app.use(() => {
      let err = new Error('boom');
      err.statusCode = 501;
      throw err;
    });

    request(app.listen())
    .get('/')
    .expect(501, done);
  });

  it('should emit errors', done => {
    let app = new Koa();
    app.use(error());
    app.use(() => {
      throw new Error('boom');
    });

    app.once('error', (err, ctx) => {
      assert.equal('boom', err.message);
      assert.equal(500, ctx.status);
      return done();
    });

    request(app.listen())
    .get('/')
    .expect(500, () => {});
  });

  it('should throw 404 if no route matches', done => {
    let app = new Koa();
    app.use(error());

    request(app.listen())
    .get('/')
    .expect(404, (err, res) => {
      assert.equal('Not Found', res.body.message);
      assert.equal(404, res.body.status);
      return done(err);
    });
  });

  it('should throw 404 if status is set explicitly but response body is left empty', done => {
    let app = new Koa();
    app.use(error());

    app.use(ctx => {
      ctx.status = 404;
    });

    request(app.listen())
    .get('/')
    .expect(404, (err, res) => {
      assert.equal('Not Found', res.body.message);
      assert.equal(404, res.body.status);
      return done(err);
    });
  });
});

describe('with custom format function', () => {
  it('should allow defining a format function', () => {
    let options = {
      format: Function.prototype
    };

    let app = new Koa();
    assert.doesNotThrow(() => {
      app.use(error(options));
    });
  });

  it('should respect custom format while preserving status', done => {
    let options = {
      format: () => {
        return {
          status: 200,
          message: 'OK'
        };
      }
    };

    let app = new Koa();
    app.use(error(options));
    app.use(() => {
      let err = new Error('boom');
      err.statusCode = 501;
      err.customField = 'fatal';
      throw err;
    });

    request(app.listen())
    .get('/')
    .expect(501, (err, res) => {
      if (err) {
        return done(err);
      }
      assert.equal('OK', res.body.message);
      assert.equal(200, res.body.status);
      return done();
    });
  });
});

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
        assert.ifError(err);
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
        assert.ifError(err);
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
        assert.ifError(err);
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
        assert.ifError(err);
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

describe('with custom options', () => {
  it('should allow defining a pre, post and format functions', () => {
    let options = {
      preFormat: Function.prototype,
      format: Function.prototype,
      postFormat: Function.prototype
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
        assert.ifError(err);
        assert.equal('OK', res.body.message);
        assert.equal(200, res.body.status);
        return done();
      });
  });

  it('should allow overriding of preFormat function', done => {
    let options = {
      preFormat: () => {
        return {
          status: -100,
          message: 'ERROR'
        };
      }
    };

    let app = new Koa();
    app.use(error(options));
    app.use(() => {
      let err = new Error('boom');
      err.statusCode = 422;
      err.customEnumerableField = 'fatal';
      throw err;
    });

    request(app.listen())
      .get('/')
      .expect(422, (err, res) => {
        assert.ifError(err);
        assert.equal(undefined, res.body.customEnumerableField);
        assert.equal(422, res.body.status);
        return done();
      });
  });

  it('should redirect when pass redirect options', done => {
    const options = {
      redirect: '/error'
    };

    const app = new Koa();

    app.use(error(options));
    app.use(() => {
      let err = new Error('boom');
      err.statusCode = 422;
      err.customEnumerableField = 'fatal';
      throw err;
    });

    request(app.listen())
      .get('/')
      .expect(422, (err, res) => {
        assert.equal(res.header.location, '/error');
        assert.equal(res.status, 302);
        return done()
      });
  });
});

describe('with a format function as options', () => {
  it('should allow passing a function as argument', done => {
    let app = new Koa();
    assert.doesNotThrow(() => {
      app.use(error(Function.prototype));
      return done();
    });
  });

  it('should behave as if preFormat and postFormat were no-ops', done => {
    let options = err => {
      return {
        why: err.reason,
        status: err.status || -200
      };
    };

    let app = new Koa();
    app.use(error(options));
    app.use(() => {
      let err = new Error('boom');
      err.reason = 'Not 42';
      err.customEnumerableField = 'fail';
      throw err;
    });

    request(app.listen())
      .get('/')
      .expect(500, (err, res) => {
        assert.ifError(err);
        assert.deepEqual({
          status: -200,
          why: 'Not 42'
        }, res.body);
        assert.equal(undefined, res.body.customEnumerableField);
        return done();
      });
  });
});

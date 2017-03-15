'use strict';
/**
 * Error handler for pure-JSON Koa 2.0.0+ apps.
 *
 *```
 * const Koa = require('koa');
 * const error = require('koa-json-error')
 *
 * let app = new Koa();
 * app.use(error());
 *```
 *
 * @module koa-json-error
 */
module.exports = require('./lib/middleware');

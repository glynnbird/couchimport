/* global describe it before */
const COUCH_URL = 'https://myuser:mypassword@myaccount.server2.com'
const MY_DATABASE = 'mydatabase2'
const MY_TRANSFORM = './test/testtransform.js'
const MY_DELIMITER = '&'
const MY_META = JSON.stringify({ b: 'mymeta' })
const MY_TYPE = 'json'
const MY_BUFFER_SIZE = '1001'
const MY_JSON_PATH = 'abc1234'
const MY_PARALLELISM = 43
const COUCH_IGNORE_FIELDS = 'a,b'
let config
const assert = require('assert')

describe('Environment variables', function () {
  before(function () {
    process.argv = ['node', 'couchimport.js']
    process.env.COUCH_URL = COUCH_URL
    process.env.COUCH_DATABASE = MY_DATABASE
    process.env.COUCH_TRANSFORM = MY_TRANSFORM
    process.env.COUCH_DELIMITER = MY_DELIMITER
    process.env.COUCH_META = MY_META
    process.env.COUCH_FILETYPE = MY_TYPE
    process.env.COUCH_BUFFER_SIZE = MY_BUFFER_SIZE
    process.env.COUCH_JSON_PATH = MY_JSON_PATH
    process.env.COUCH_PARALLELISM = MY_PARALLELISM
    process.env.COUCH_IGNORE_FIELDS = COUCH_IGNORE_FIELDS
    config = require('../includes/args.js').parse()
  })

  it('respects the url variable', function (done) {
    assert.strictEqual(typeof config.url, 'string')
    assert.strictEqual(config.url, COUCH_URL)
    done()
  })

  it('respects the db variable', function (done) {
    assert.strictEqual(typeof config.database, 'string')
    assert.strictEqual(config.database, MY_DATABASE)
    done()
  })

  it('respects the transform variable', function (done) {
    assert.strictEqual(typeof config.transform, 'function')
    done()
  })

  it('respects the delimiter variable', function (done) {
    assert.strictEqual(typeof config.delimiter, 'string')
    assert.strictEqual(config.delimiter, MY_DELIMITER)
    done()
  })

  it('respects the meta variable', function (done) {
    var str = JSON.stringify(config.meta)
    assert.strictEqual(str, MY_META)
    done()
  })

  it('respects the type variable', function (done) {
    assert.strictEqual(typeof config.type, 'string')
    assert.strictEqual(config.type, MY_TYPE)
    done()
  })

  it('respects the buffer variable', function (done) {
    assert.strictEqual(typeof config.buffer, 'number')
    assert.strictEqual(config.buffer, parseInt(MY_BUFFER_SIZE))
    done()
  })

  it('respects the jsonpath variable', function (done) {
    assert.strictEqual(typeof config.jsonpath, 'string')
    assert.strictEqual(config.jsonpath, MY_JSON_PATH)
    done()
  })

  it('respects the parallelism variable', function (done) {
    assert.strictEqual(typeof config.parallelism, 'number')
    assert.strictEqual(config.parallelism, parseInt(MY_PARALLELISM))
    done()
  })

  it('respects the ignore variable', function (done) {
    assert.strictEqual(typeof config.ignorefields, 'object')
    assert.strictEqual(config.ignorefields.length, 2)
    done()
  })

  after(function () {
    delete require.cache[require.resolve('../includes/args.js')]
    delete process.env.COUCH_URL
    delete process.env.COUCH_DATABASE
    delete process.env.COUCH_TRANSFORM
    delete process.env.COUCH_DELIMITER
    delete process.env.COUCHIMPORT_META
    delete process.env.COUCH_FILETYPE
    delete process.env.COUCH_BUFFER_SIZE
    delete process.env.COUCH_JSON_PATH
    delete process.env.COUCH_PARALLELISM
    delete process.env.COUCH_IGNORE_FIELDS
  })
})

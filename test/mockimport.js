/* global describe it before */
const nock = require('nock')
const URL = 'http://localhost:5984'
const couchimport = require('../app.js')
const assert = require('assert')

const opts = { delimiter: ',', url: URL, database: 'mydb', buffer: 100 }

describe('Input CSV file', function () {
  before(function () {
  })

  it('import a CSV file', function (done) {
    this.timeout(5000)
    const path = require('path')
    const p = path.join(__dirname, 'test.csv')
    nock(URL)
      .post('/mydb/_bulk_docs')
      .reply(function (uri, body) {
        const retval = []
        for (let i = 0; i < 99; i++) {
          let obj
          if (i % 2 === 0) {
            obj = {
              id: i,
              rev: i + '-abc123',
              ok: true
            }
          } else {
            obj = {
              id: i,
              error: 'conflict',
              reason: 'Document update conflict'
            }
          }

          retval.push(obj)
        }
        return [200, retval]
      })
    couchimport.importFile(p, opts, function (err, data) {
      assert.strictEqual(err, null)
      assert.strictEqual(typeof data, 'object')
      assert.strictEqual(data.total, 49)
      assert.strictEqual(data.totalfailed, 50)
      done()
    })
  })

  after(function () {
    nock.cleanAll()
  })
})

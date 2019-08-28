var couchimport = require('../app.js')
var assert = require('assert')
var opts = { preview: true }

describe('Preview mode', function () {
  it('preview csv', function (done) {
    couchimport.previewCSVFile('./test/test.csv', opts, function (err, data, delimiter) {
      assert.strictEqual(err, null)
      assert.strictEqual(typeof data, 'object')
      assert.strictEqual(typeof delimiter, 'string')
      assert.strictEqual(delimiter, ',')
      done()
    })
  })

  it('preview tsv', function (done) {
    couchimport.previewCSVFile('./test/guitars.tsv', opts, function (err, data, delimiter) {
      assert.strictEqual(err, null)
      assert.strictEqual(typeof data, 'object')
      assert.strictEqual(typeof delimiter, 'string')
      assert.strictEqual(delimiter, '\t')
      done()
    })
  })

  it('preview tsv with transform', function (done) {
    opts.transform = function (doc) {
      doc.price = parseFloat(doc.price)
      return doc
    }
    couchimport.previewCSVFile('./test/guitars.tsv', opts, function (err, data, delimiter) {
      assert.strictEqual(err, null)
      assert.strictEqual(typeof data, 'object')
      assert.strictEqual(typeof data[0].price, 'number')
      assert.strictEqual(typeof delimiter, 'string')
      assert.strictEqual(delimiter, '\t')
      done()
    })
  })

  it('preview nonsense', function (done) {
    couchimport.previewCSVFile('./test/guitars.tsv', opts, function (err, data, delimiter) {
      assert.strictEqual(err, null)
      assert.strictEqual(typeof data, 'object')
      assert.strictEqual(typeof delimiter, 'string')
      assert.strictEqual(delimiter, '\t')
      done()
    })
  })
})

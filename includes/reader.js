module.exports = function (couchURL, couchDatabase, blocksize) {
  const cloudant = require('@cloudant/cloudant')(couchURL)
  const db = cloudant.db.use(couchDatabase)
  let startdocid = null

  const bulkRead = function (callback) {
    if (startdocid === false) {
      return callback(new Error('Done'), null)
    }
    const opts = { limit: blocksize + 1, include_docs: true }
    if (startdocid) {
      opts.startkey_docid = startdocid
    }
    db.list(opts, function (err, data) {
      if (err) {
        console.error('ERROR', err.statusCode, err.reason)
        return callback(err, null)
      }
      if (data.rows.length === blocksize + 1) {
        startdocid = data.rows[blocksize].id
      } else {
        startdocid = false
      }

      const docs = []
      for (var i = 0; i < Math.min(data.rows.length, blocksize); i++) {
        delete data.rows[i].doc._rev
        docs.push(data.rows[i].doc)
      }
      callback(null, docs)
    })
  }

  return bulkRead
}

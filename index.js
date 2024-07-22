const { pipeline } = require('node:stream/promises')
const { Transform } = require('node:stream')
const jsonpour = require('jsonpour')
const Nano = require('nano')

const couchimport = async (opts) => {
  // mandatory parameters
  if (!opts.url || !opts.database) {
    throw new Error('must supply url and database')
  }

  // streams
  opts.rs = opts.rs || process.stdin
  opts.ws = opts.ws || process.stdout

  // CouchDB client
  const nano = Nano(opts.url)
  const db = nano.db.use(opts.database)

  // buffer of documents waiting to be written
  const batch = []
  opts.batch = opts.batch > 1 ? opts.batch : 500

  // status - the progress of the insert
  const status = {
    batch: 0,
    batchSize: 0,
    totalDocCount: 0,
    successCount: 0,
    failCount: 0,
    statusCodes: { }
  }

  // a Node.js stream transformer that takes a stream of individual
  // changes and groups them into batches of opts.buffer except the
  // last batch which may be smaller.
  const batcher = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform (obj, _, callback) {
      // push the change into our batch array
      batch.push(obj)
      // if we have at least a full batch
      if (batch.length >= opts.buffer) {
        // send a full batch to the next thing in the pipeline
        this.push(batch.splice(0, opts.buffer))
      }
      callback()
    },
    flush (callback) {
      // handle the any remaining buffered data
      if (batch.length > 0) {
        // send anything left as a final batch
        this.push(batch)
      }
      callback()
    }
  })

  // a Node.js stream transformer that takes a stream of individual
  // changes and groups them into batches of opts.buffer except the
  // last batch which may be smaller.
  const writer = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform (obj, _, callback) {
      // push the change into our batch array
      db.bulk({ docs: obj }, (err, response, headers) => {
        if (!status.statusCodes[headers.statusCode]) {
          status.statusCodes[headers.statusCode] = 0
        }
        status.statusCodes[headers.statusCode]++
        status.batch++
        status.batchSize = obj.length
        if (err) {
          status.failCount++
        } else {
          status.successCount++
          status.totalDocCount += obj.length
        }
        this.push(`written ${JSON.stringify(status)}\n`)
        callback()
      })
    }
  })

  // stream every object from the results array via a filter to stdout
  await pipeline(
    opts.rs,
    jsonpour.parse(),
    batcher,
    writer,
    opts.ws,
    { end: false }
  )
  return status
}

module.exports = couchimport


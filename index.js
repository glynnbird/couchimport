const { pipeline } = require('node:stream/promises')
const { Transform } = require('node:stream')
const jsonpour = require('jsonpour')
const package = require('./package.json')
const ccurllib = require('ccurllib')

const couchimport = async (opts) => {
  // mandatory parameters
  if (!opts.url || !opts.database) {
    throw new Error('must supply url and database')
  }

  // streams
  opts.rs = opts.rs || process.stdin
  opts.ws = opts.ws || process.stdout

  // buffer of documents waiting to be written
  const batch = []

  // the batch size, defaults to 500
  opts.buffer = opts.buffer > 1 ? opts.buffer : 500

  // status - the progress of the insert
  const status = {
    batch: 0,
    batchSize: 0,
    docSuccessCount: 0,
    docFailCount: 0,
    statusCodes: { },
    errors: {}
  }

  // a Node.js stream transformer that takes a stream of individual
  // documents and groups them into batches of opts.buffer except the
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
      // handle any remaining buffered data
      if (batch.length > 0) {
        // send anything left as a final batch
        this.push(batch)
      }
      callback()
    }
  })

  // a Node.js stream transformer that receives batches (arrays) of
  // objects which are written to CouchDB's bulk_docs endpoint
  const writer = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform (obj, _, callback) {
      // generate a bulk_docs request containing the supplied batch
      // of documents to write
      const req = {
        method: 'post',
        url: `${opts.url}/${opts.database}/_bulk_docs`,
        body: JSON.stringify({ docs: obj }),
        headers: {
          'user-agent': `${package.name}/${package.version}`,
          'content-type': 'application/json'
        }
      }
      
      // increment running totals
      status.batch++
      status.batchSize = obj.length

      // make the request
      ccurllib.request(req).then((response) => {
        if (!status.statusCodes[response.status]) {
          status.statusCodes[response.status] = 0
        }
        status.statusCodes[response.status]++
        if (response.status < 400) {
          // the status codes doesn't tell the whole storry, we have
          // to inspect each of the array of responses to see if a
          // document actually got insterted or not.
          for(const r of response.result) {
            if (r.ok) {
              status.docSuccessCount++
            } else {
              status.docFailCount++
              if (!status.errors[r.error]) {
                status.errors[r.error] = 0
              }
              status.errors[r.error]++
            }
          }
        } else {
          // if we got an HTTP code >= 400 then all the inserts failed
          status.docFailCount += obj.length
        }

        // write some output to show ongoing progress
        this.push(`written ${JSON.stringify(status)}\n`)
        callback()
      })
    }
  })

  // stream every object from the input stream, through the transformers
  // to the output stream
  await pipeline(
    opts.rs,            // stdin, by default
    jsonpour.parse(),   // streaming JSON parser, emits once per object
    batcher,            // batches individual objects into arrays
    writer,             // writes arrays to CouchDB bulk_docs
    opts.ws,            // output status to stdout, by default
    { end: false }
  )
  return status
}

module.exports = couchimport


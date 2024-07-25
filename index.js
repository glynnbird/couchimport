const { pipeline } = require('node:stream/promises')
const { Transform } = require('node:stream')
const jsonpour = require('jsonpour')
const package = require('./package.json')

// simple wrapper around fetch
const request = async (opts) => {
  const parsedUrl = new URL(opts.baseUrl)
  const req = {
    method: opts.method || 'get',
    headers: {
      'user-agent': `${package.name}@${package.version}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify(opts.body)
  }
  if (parsedUrl.username && parsedUrl.password) {
    req.headers.authorization = `Basic ${btoa(parsedUrl.username + ':' + parsedUrl.password)}`
  }
  let u = `${parsedUrl.origin}${opts.url}`
  if (opts.qs && typeof opts.qs === 'object') {
    u += '?' + new URLSearchParams(opts.qs)
  }
  const response = await fetch(u, req)
  return {
    status: response.status,
    result: await response.json()
  }
}

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
  opts.batch = opts.batch > 1 ? opts.batch : 500

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
      const req = {
        method: 'post',
        baseUrl: opts.url,
        url: `/${opts.database}/_bulk_docs`,
        body: { docs: obj }
      }
      status.batch++
      status.batchSize = obj.length
      request(req).then((response) => {
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


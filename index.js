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
  const retval = {
    statusCode: response.status,
    response: await response.json()
  }
  return retval
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
      const req = {
        method: 'post',
        baseUrl: opts.url,
        url: `/${opts.database}/_bulk_docs`,
        body: { docs: obj }
      }
      status.batch++
      status.batchSize = obj.length
      request(req).then((response) => {
        if (!status.statusCodes[response.statusCode]) {
          status.statusCodes[response.statusCode] = 0
        }
        status.statusCodes[response.statusCode]++
        if (response.statusCode < 400) {
          status.successCount++
          status.totalDocCount += obj.length
        } else {
          status.failCount++
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

// const m = async () => {
//   const req = {
//     baseUrl: process.env.COUCH_URL,
//     url: '/cities/_all_docs',
//     qs: {
//       limit: 5,
//       include_docs: true
//     }
//   }
//   const response = await request(req)
//   console.log(response)
// }

// m()

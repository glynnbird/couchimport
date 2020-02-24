const async = require('async')
const debug = require('debug')('couchimport')
const iam = require('./iam.js')
const axios = require('axios').default

// look for IAM_API_KEY
const IAM_API_KEY = process.env.IAM_API_KEY ? process.env.IAM_API_KEY : null
let iamAccessToken = null

module.exports = function (couchURL, couchDatabase, bufferSize, parallelism, ignoreFields, overwrite) {
  const stream = require('stream')

  let buffer = []

  let written = 0
  let totalfailed = 0
  const writer = new stream.Transform({ objectMode: true })

  iam.getToken(IAM_API_KEY).then(function (t) {
    iamAccessToken = t

    const headers = { }
    if (IAM_API_KEY && iamAccessToken) {
      headers.Authorization = 'Bearer ' + iamAccessToken
    }

    // process the writes in bulk as a queue
    const q = async.queue(async (payload) => {
      // detected whether we need to supply new_edits = false
      let allHaveRev = true
      for (var i in payload.docs) {
        if (!payload.docs[i]._rev) {
          allHaveRev = false
          break
        }
      }
      if (allHaveRev) {
        payload.new_edits = false
      }

      // check if we need to look for previous revisions
      if (overwrite) {
        // get list of document ids to fetch
        const keys = []
        for (i in payload.docs) {
          if (payload.docs[i]._id) {
            keys.push(payload.docs[i]._id)
          }
        }
        const req = {
          method: 'post',
          baseURL: couchURL,
          url: couchDatabase + '/_all_docs',
          data: { keys: keys },
          headers: headers
        }
        const response = axios(req)
        const existingData = response.data

        // make lookup table between id-->rev
        const lookup = {}
        for (i in existingData.rows) {
          if (existingData.rows[i].id && !existingData.rows[i].value.deleted) {
            lookup[existingData.rows[i].id] = existingData.rows[i].value.rev
          }
        }

        // use lookup table to back-fill _rev into user-supplied data
        for (i in payload.docs) {
          if (payload.docs[i]._id && lookup[payload.docs[i]._id]) {
            payload.docs[i]._rev = lookup[payload.docs[i]._id]
          } else {
            delete payload.docs[i]._rev
          }
        }

        // disable new_edits=false in overwrite mode - no conflicts please
        delete payload.new_edits
      }

      // write data
      let data = null
      try {
        const req = {
          method: 'post',
          baseURL: couchURL,
          url: couchDatabase + '/_bulk_docs',
          headers: headers,
          data: payload
        }
        const response = await axios(req)
        data = response.data
      } catch (e) {
        console.log('ERR', e)
        writer.emit('writeerror', e)
      }

      let ok = 0
      let failed = 0
      if (allHaveRev) {
        ok += payload.docs.length
      } else {
        for (i in data) {
          const d = data[i]
          const isok = !!((d.id && d.rev))
          if (isok) {
            ok++
          } else {
            failed++
            writer.emit('writefail', d)
            debug(d)
          }
        }
      }
      written += ok
      totalfailed += failed
      writer.emit('written', { documents: ok, failed: failed, total: written, totalfailed: totalfailed })
      debug({ documents: ok, failed: failed, total: written, totalfailed: totalfailed })
    }, parallelism)

    // write the contents of the buffer to CouchDB in blocks of 500
    const processBuffer = function (flush, callback) {
      if (flush || buffer.length >= bufferSize) {
        const toSend = buffer.splice(0, buffer.length)
        buffer = []
        q.push({ docs: toSend })

        // wait until the buffer size falls to a reasonable level
        async.until(

          // wait until the queue length drops to twice the paralellism
          // or until empty
          function () {
            if (flush) {
              return q.idle() && q.length() === 0
            } else {
              return q.length() <= parallelism * 2
            }
          },

          function (cb) {
            setTimeout(cb, 100)
          },

          function () {
            if (flush) {
              writer.emit('writecomplete', { total: written, totalfailed: totalfailed })
            }
            callback()
          })
      } else {
        callback()
      }
    }

    // take an object
    writer._transform = function (obj, encoding, done) {
      // add to the buffer, if it's not an empty object
      if (obj && typeof obj === 'object' && Object.keys(obj).length > 0) {
        if (ignoreFields) {
          ignoreFields.forEach(function (f) {
            delete obj[f]
          })
        }
        if (Object.keys(obj).length > 0) {
          buffer.push(obj)
        }
      }

      // optionally write to the buffer
      this.pause()
      processBuffer(false, function () {
        done()
      })
    }

    // called when we need to flush everything
    writer._flush = function (done) {
      processBuffer(true, function () {
        done()
      })
    }
  })

  return writer
}

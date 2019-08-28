const async = require('async')
const debug = require('debug')('couchimport')

module.exports = function (couchURL, couchDatabase, bufferSize, parallelism, ignoreFields) {
  const stream = require('stream')

  let buffer = []

  let written = 0
  let totalfailed = 0

  const cloudant = require('nano')(couchURL)
  const db = cloudant.db.use(couchDatabase)

  // process the writes in bulk as a queue
  const q = async.queue(function (payload, cb) {
    db.bulk(payload, function (err, data) {
      if (err) {
        console.log('ERR', err)
        writer.emit('writeerror', err)
      } else {
        let ok = 0
        let failed = 0
        for (var i in data) {
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
        written += ok
        totalfailed += failed
        writer.emit('written', { documents: ok, failed: failed, total: written, totalfailed: totalfailed })
        debug({ documents: ok, failed: failed, total: written, totalfailed: totalfailed })
      }
      cb()
    })
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

  const writer = new stream.Transform({ objectMode: true })

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

  return writer
}

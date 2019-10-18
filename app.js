const fs = require('fs')
const debugimport = require('debug')('couchimport')
const debugexport = require('debug')('couchexport')
const preview = require('./includes/preview.js')
const defaults = require('./includes/defaults.js')
const iam = require('./includes/iam.js')

// import a file stream into CouchDB
// rs - readable stream
// opts - an options object, or null for defaults
// callback - called when complete
const importStream = function (rs, opts, callback) {
  // sort the paramters
  if (typeof callback === 'undefined' && typeof opts === 'function') {
    callback = opts
    opts = {}
  }

  opts = defaults.merge(opts)

  // load dependencies
  const writer = require('./includes/writer.js')(opts.url, opts.database, opts.buffer, opts.parallelism, opts.ignorefields, opts.overwrite)
  const transformer = require('./includes/transformer.js')(opts.transform, opts.meta)
  const JSONStream = require('JSONStream')
  if (opts.type === 'jsonl') {
    // pipe the file to a streaming JSON parser
    rs.pipe(JSONStream.parse())
      .pipe(transformer) // process each object
      .pipe(writer) // write the data
  } else if (opts.type === 'json') {
    // if this is a JSON stream
    if (!opts.jsonpath) {
      const msg = 'ERROR: you must specify a JSON path using --jsonpath or COUCH_JSON_PATH'
      debugimport(msg)
      return callback(msg, null)
    }
    // pipe the file to a streaming JSON parser
    rs.pipe(JSONStream.parse(opts.jsonpath))
      .pipe(transformer) // process each object
      .pipe(writer) // write the data
  } else {
    // load the CSV parser
    const parse = require('csv-parse')

    const objectifier = parse({ delimiter: opts.delimiter, columns: true, skip_empty_lines: true, relax: true })

    // pipe the input to the output, via transformation functions
    rs.pipe(objectifier) // turn each line into an object
      .pipe(transformer) // process each object
      .pipe(writer) // write the data
  }

  writer.on('writecomplete', function (data) {
    callback(null, data)
  })

  rs.on('error', function (e) {
    debugimport('error', e)
    callback(e, null)
  })

  return writer
}

// import a named file into CouchDB
// filename - name of the file stream
// opts - an options object, or null for defaults
// callback - called when complete
const importFile = function (filename, opts, callback) {
  return importStream(fs.createReadStream(filename), opts, callback)
}

const strip = function (str) {
  return str.replace(/\n/g, ' ').replace(/\r/g, '')
}

// export to a writable stream
// ws - writable stream
// opts - an options object, or null for defaults
// callback - called when complete
const exportStream = function (ws, opts, callback) {
  // export a row as a CSV
  const exportAsCSV = function (row) {
    // ignore design docs
    if (row._id.match(/^_design/)) {
      return
    }

    // if we are extracting headings
    if (headings.length === 0) {
      headings = Object.keys(row)
      if (opts.ignorefields) {
        const h = []
        headings.forEach((f) => {
          if (!opts.ignorefields.includes(f)) {
            h.push(f)
          }
        })
      }
      ws.write(headings.join(opts.delimiter) + '\n')
    }

    // output columns
    const cols = []
    for (var i in headings) {
      const v = row[headings[i]]
      const t = typeof v
      if (v == null) {
        cols.push('null')
      } else if (t === 'undefined') {
        cols.push('')
      } else if (t === 'string') {
        cols.push(strip(v))
      } else {
        cols.push(v.toString())
      }
    }
    ws.write(cols.join(opts.delimiter) + '\n')
  }

  // sort the paramters
  if (typeof callback === 'undefined' && typeof opts === 'function') {
    callback = opts
    opts = {}
  }

  opts = defaults.merge(opts)
  let total = 0
  let headings = []
  let lastsize = 0
  iam.getToken(process.env.IAM_API_KEY).then((t) => {
    const nanoopts = { url: opts.url }
    if (t) {
      nanoopts.defaultHeaders = { Authorization: 'Bearer ' + t }
    }
    const Nano = require('nano')
    const nano = Nano(nanoopts)
    const ChangesReader = require('changesreader')
    const changesReader = new ChangesReader(opts.database, nano.request)

    const changesOpts = {
      batchSize: opts.buffer,
      includeDocs: true,
      since: '0',
      timeout: 0
    }
    changesReader.get(changesOpts)
      .on('batch', (batch) => {
        lastsize = batch.length
        total += lastsize
        for (var i in batch) {
          if (!batch[i].doc._deleted) {
            // apply transform
            if (typeof opts.transform === 'function') {
              batch[i].doc = opts.transform.apply(null, [batch[i].doc, opts.meta])
            }
            switch (opts.type) {
              case 'json':
              case 'jsonl':
                ws.write(JSON.stringify(batch[i].doc) + '\n')
                break
              case 'text':
                exportAsCSV(batch[i].doc)
                break
            }
          }
        }
        debugexport('Output', batch.length, '[' + total + ']')
      })
      .on('end', () => {
        callback(null, null)
      })
      .on('error', (e) => {
        console.log('ERROR', e)
        callback(e, null)
      })
  })
}

// export to a named file
// filename - name of the file stream
// opts - an options object, or null for defaults
// callback - called when complete
const exportFile = function (filename, opts, callback) {
  exportStream(fs.createWriteStream(filename), opts, callback)
}

// load the first 10k of a file and parse the first 3 lines
// filename - name of the file to load
// opts - an options object, or null for defaults
// callback - called when complete
const previewCSVFile = preview.file

// load the first 10k of a URL and parse the first 3 lines
// URL - name of the file to load
// opts - an options object, or null for defaults
// callback - called when complete
const previewURL = preview.url

// load the first 10k of a URL and parse the first 3 lines
// URL - name of the file to load
// opts - an options object, or null for defaults
// callback - called when complete
const previewStream = preview.stream

module.exports = {
  importStream: importStream,
  importFile: importFile,
  exportStream: exportStream,
  exportFile: exportFile,
  previewCSVFile: previewCSVFile,
  previewURL: previewURL,
  previewStream: previewStream
}

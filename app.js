const fs = require('fs')
const async = require('async')
const _ = require('underscore')
const debugimport = require('debug')('couchimport')
const debugexport = require('debug')('couchexport')
const preview = require('./includes/preview.js')
const defaults = require('./includes/defaults.js')

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
  const writer = require('./includes/writer.js')(opts.url, opts.database, opts.buffer, opts.parallelism, opts.ignorefields)
  const transformer = require('./includes/transformer.js')(opts.transform, opts.meta)
  const JSONStream = require('JSONStream')
  if (opts.type === 'jsonl') {
    // pipe the file to a streaming JSON parser
    rs.pipe(JSONStream.parse())
      .pipe(transformer) // process each object
      .pipe(writer) // write the data
  } else if (opts.type === 'json') {
    // if this is a JSON stream
    if (!opts['jsonpath']) {
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
    debugimport('writecomplete', data)
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
  let escape = null

  // sort the paramters
  if (typeof callback === 'undefined' && typeof opts === 'function') {
    callback = opts
    opts = {}
  }

  opts = defaults.merge(opts)

  let total = 0

  let headings = []

  let lastsize = 0

  const reader = require('./includes/reader.js')(opts.url, opts.database, opts.buffer)

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
        opts.ignorefields.forEach(function (f) {
          headings = _.without(headings, f)
        })
      }
      ws.write(headings.join(opts.delimiter) + '\n')
    }

    // output columns
    let cols = []
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

  async.doUntil(function (callback) {
    reader(function (err, data) {
      if (err) {
        return callback(err)
      }
      lastsize = data.length
      total += lastsize
      for (var i in data) {
        exportAsCSV(data[i])
      }
      debugexport('Output', data.length, '[' + total + ']')
      callback(null)
    })
  },
  function () {
    return (lastsize === 0 || escape)
  },
  function (err) {
    debugexport('Output complete')
    if (err) {
      callback(escape, null)
    } else {
      callback(null, null)
    }
  })

  ws.on('error', function (err) {
    escape = err
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

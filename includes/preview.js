
const URL = require('url')
const parse = require('csv-parse')
const fs = require('fs')

const analyseString = function (str, callback) {
  const lines = str.split('\n')
  str = lines.splice(0, 4).join('\n') + '\n'
  parse(str, { delimiter: ',', columns: true, skip_empty_lines: true, relax: true }, function (err1, csvdata) {
    parse(str, { delimiter: '\t', columns: true, skip_empty_lines: true, relax: true }, function (err2, tsvdata) {
      let delimiter = '?' // unknown

      // look at CSV version
      if (!err1) {
        if (csvdata && csvdata.length > 0 && Object.keys(csvdata[0]).length > 1) {
          delimiter = ','
          return callback(null, csvdata, delimiter)
        }
      }

      // look at TSV version
      if (!err2) {
        if (tsvdata && tsvdata.length > 0 && Object.keys(tsvdata[0]).length > 1) {
          delimiter = '\t'
          return callback(null, tsvdata, delimiter)
        }
      }
      // not sure what type of data it is
      return callback(null, '', delimiter)
    })
  })
}

// preview a URL
const first10kURL = function (u, callback) {
  let b = Buffer.alloc()
  let onceonly = false

  const alldone = function () {
    if (!onceonly) {
      const str = b.toString('utf8')
      onceonly = true
      callback(null, str)
    }
  }

  const parsed = new URL.URL(u)
  let agent
  if (parsed.protocol === 'http:') {
    agent = require('http')
  } else if (parsed.protocol === 'https:') {
    agent = require('https')
  } else {
    return callback(new Error('Invalid protocol - ' + parsed.protocol), null)
  }

  agent.get(u, function (rs) {
    rs.on('data', function (d) {
      b = Buffer.concat([b, d])
      if (b.length > 10000) {
        rs.destroy()
        alldone()
      }
    })
  }).on('error', alldone)
    .on('end', alldone)
}

const url = function (u, opts, callback) {
  first10kURL(u, function (err, data) {
    if (err) {
      return callback(err, null)
    }
    analyseString(data, callback)
  })
}

const file = function (filename, opts, callback) {
  const rs = fs.createReadStream(filename, { encoding: 'utf8' })
  stream(rs, opts, callback)
}

const stream = function (rs, opts, callback) {
  let calledback = false

  rs.on('readable', function () {
    let str = ''
    let chunk
    while ((chunk = rs.read()) !== null) {
      str += chunk.toString('utf8')
      if (chunk === null || str.length >= 10000) {
        break
      }
    }
    rs.destroy(rs)
    if (!calledback) {
      calledback = true
      analyseString(str, function (err, data, delimiter) {
        // allow transformation in preview
        if (opts.transform && typeof opts.transform === 'function') {
          const func = opts.transform
          for (const i in data) {
            data[i] = func(data[i], opts.meta)
          }
        }

        callback(err, data, delimiter)
      })
    }
  }).on('error', function (e) {
    if (!calledback) {
      callback(e, null, '?')
    }
  })
}

module.exports = {
  file: file,
  url: url,
  stream: stream
}

#!/usr/bin/env node
process.env.DEBUG = (process.env.DEBUG) ? process.env.DEBUG + ',couchimport' : 'couchimport'
const debug = require('debug')('couchimport')
const couchimport = require('../app.js')
const argv = require('../includes/args.js').parse()

// output selected options
const options = ['url', 'database', 'delimiter', 'transform', 'meta', 'buffer', 'parallelism', 'type', 'jsonpath', 'preview', 'ignorefields', 'overwrite']
console.log('couchimport')
console.log('-----------')
for (const i in options) {
  if (argv[options[i]]) {
    const k = options[i].padEnd(11, ' ')
    let v
    if (options[i] === 'url') {
      v = JSON.stringify(argv[options[i]].replace(/\/\/.+@/, '//****:****@'))
    } else {
      v = JSON.stringify(argv[options[i]])
    }
    console.log('', k, ':', v)
  }
}
console.log('-----------')

// if preview mode
if (argv.preview) {
  couchimport.previewStream(process.stdin, argv, function (err, data, delimiter) {
    if (err) {
      console.log('Error', err)
    }
    switch (delimiter) {
      case ',':
        console.log('Detected a COMMA column delimiter')
        break
      case '\t':
        console.log('Detected a TAB column delimiter')
        break
      default:
        console.log('Detected an unknown column delimiter')
        break
    }
    if (data && data.length > 0) {
      console.log(data[0])
    }
  })
} else {
  // import data from a stdin
  couchimport.importStream(process.stdin, argv, function (err, data) {
    debug('Import complete')
    if (err) {
      console.error('Error', err)
    }
    process.exit(0)
  }).on('written', function (data) {
    debug('Written ok:' + data.documents + ' - failed: ' + data.failed + ' -  (' + data.total + ')')
  }).on('writeerror', function (err) {
    debug('ERROR', err)
  })
}

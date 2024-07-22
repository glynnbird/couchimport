#!/usr/bin/env node
const couchimport = require('../app.js')
const syntax = 
`Syntax:
--url/-u           (COUCH_URL)           the URL of the CouchDB instance                     (required)
--database/--db/-d (COUCH_DATABASE)      CouchDB Datbase name                                (required)
--delimiter        (COUCH_DELIMITER)     the CSV delimiter character                         (default: <tab>)
--transform        (COUCH_TRANSFORM)     path to a JavaScript transformation function
--meta/-m          (COUCH_META)          a JSON object passed to the transformation function
--buffer/-b        (COUCH_BUFFER_SIZE)   # docs written per bulk write                       (default: 500)
--parallelism      (COUCH_PARALLELISM)   # of HTTP requests to have in-flight at once        (default: 1)
--maxwps           (MAX_WPS)             the max write operations per second                 (default: 0 )
--type/-t          (COUCH_FILETYPE)      type of file: text/json/jsonl                       (default: text)
--jsonpath/-j      (COUCH_JSON_PATH)     path into the incoming JSON doc (type=json only)
--preview/-p       (COUCH_PREVIEW)       if true, runs in preview mode                       (default: false)
--ignorefields/-i  (COUCH_IGNORE_FIELDS) a comma-separated list of fields to ignore
--overwrite/-o     (COUCH_OVERWRITE)     if true, overwrites docs with supplied data         (default: false)
--retry/-r         (COUCH_RETRY)         if true, retries HTTP with 429 response             (default: false)
`
const URL = process.env.COUCH_URL ? process.env.COUCH_URL : undefined
const DATABASE = process.env.COUCH_DATABASE ? process.env.COUCH_DATABASE : undefined
const DELIMITER = process.env.COUCH_DELIMITER ? process.env.COUCH_DELIMITER : '\t'
const TRANSFORM = process.env.COUCH_TRANSFORM ? process.env.COUCH_TRANSFORM : ''
const META = process.env.COUCH_META ? process.env.COUCH_META : ''
const BUFFER_SIZE =  process.env.COUCH_BUFFER_SIZE ? parseInt(process.env.COUCH_BUFFER_SIZE) : '500'
const PARALLELISM = process.env.COUCH_PARALLELISM ? parseInt(process.env.COUCH_PARALLELISM) : '1'
const MAX_WPS = process.env.MAX_WPS ? parseInt(process.env.MAX_WPS) : '0'
const FILETYPE = process.env.COUCH_FILETYPE ? process.env.COUCH_FILETYPE : 'text'
const JSON_PATH = process.env.COUCH_JSON_PATH ? process.env.COUCH_JSON_PATH : ''
const PREVIEW = process.env.COUCH_PREVIEW ? (process.env.COUCH_PREVIEW === 'true') : false
const IGNORE_FIELDS = process.env.COUCH_IGNORE_FIELDS ? process.env.COUCH_IGNORE_FIELDS : ''
const OVERWRITE = process.env.COUCH_OVERWRITE ? process.env.COUCH_OVERWRITE : false
const RETRY = process.env.COUCH_RETRY ? process.env.COUCH_RETRY : false

const { parseArgs } = require('node:util')
const argv = process.argv.slice(2)
const options = {
  url: {
    type: 'string',
    short: 'u',
    default: URL
  },
  db: {
    type: 'string',
    short: 'd',
    default: DATABASE
  },
  delimiter: {
    type: 'string',
    default: DELIMITER
  },
  transform: {
    type: 'string',
    default: TRANSFORM
  },
  meta: {
    type: 'string',
    short: 'm',
    default: META
  },
  buffer: {
    type: 'string',
    short: 'b',
    default: BUFFER_SIZE
  },
  parallelism: {
    type: 'string',
    default: PARALLELISM
  },
  maxwps: {
    type: 'string',
    default: MAX_WPS
  },
  type: {
    type: 'string', // 'text', 'json', 'jsonl',
    default: FILETYPE
  },
  jsonpath: {
    type: 'string',
    short: 'j',
    default: JSON_PATH
  },
  preview: {
    type: 'boolean',
    short: 'p',
    default: PREVIEW
  },
  ignorefields: {
    type: 'string',
    short: 'i',
    default: IGNORE_FIELDS
  },
  overwrite: {
    type: 'boolean',
    short: 'o',
    default: OVERWRITE
  },
  retry: {
    type: 'boolean',
    short: 'r',
    default: RETRY
  },
  help: {
    type: 'boolean',
    short: 'h',
    default: false
  }
}

// parse command-line options
const { values } = parseArgs({ argv, options })
if (values.db) {
  values.database = values.db
  delete values.db
}
if (values.buffer) {
  values.buffer = parseInt(values.buffer)
}
if (values.parallelism) {
  values.parallelism = parseInt(values.parallelism)
}
if (values.maxwps) {
  values.maxwps = parseInt(values.maxwps)
}

// help mode
if (values.help) {
  console.log(syntax)
  process.exit(0)
}

// swap blank strings for nulls
if (values.transform.length === 0) {
  values.transform = null
}
if (values.meta.length === 0) {
  values.meta = null
}
if (values.jsonpath.length === 0) {
  values.jsonpath = null
}
if (values.ignorefields.length === 0) {
  values.ignorefields = null
}

const main = async () => {
  const data = await couchimport.importStream(process.stdin, values)
  console.log('Import complete')
  console.log(data)
}
main()

/*
// if preview mode
if (values.preview) {
  couchimport.previewStream(process.stdin, values, function (err, data, delimiter) {
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
  console.log(values)
  couchimport.importStream(process.stdin, values, function (err, data) {
    console.log('Import complete')
    if (err) {
      console.error('Error', err)
    }
    process.exit(0)
  }).on('written', function (data) {
    console.error('Written ok:' + data.documents + ' - failed: ' + data.failed + ' -  (' + data.total + ')')
  }).on('writeerror', function (err) {
    console.error('ERROR', err)
  })
}
*/

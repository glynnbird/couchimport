#!/usr/bin/env node
const { open } = require('node:fs/promises')
const { parseArgs } = require('node:util')
const couchimport = require('../index.js')
const syntax =
`
couchimport <filename>

or

cat filename.json | couchimport

Parameters:

--url/-u           (COUCH_URL)           the URL of the CouchDB instance                     (required)
--database/--db/-d (COUCH_DATABASE)      CouchDB Datbase name                                (required)
--buffer/-b        (COUCH_BUFFER_SIZE)   # docs written per bulk write                       (default: 500)

e.g.

cat filename.json | couchimport --db mydb --url "http://localhost:5984" --buffer 50
`
const URL = process.env.COUCH_URL ? process.env.COUCH_URL : undefined
const DATABASE = process.env.COUCH_DATABASE ? process.env.COUCH_DATABASE : undefined
const BUFFER_SIZE = process.env.COUCH_BUFFER_SIZE ? parseInt(process.env.COUCH_BUFFER_SIZE) : '500'
const argv = process.argv.slice(2)
const options = {
  url: {
    type: 'string',
    short: 'u',
    default: URL
  },
  database: {
    type: 'string',
    short: 'd',
    default: DATABASE,
  },
  db: {
    type: 'string',
    default: DATABASE
  },
  buffer: {
    type: 'string',
    short: 'b',
    default: BUFFER_SIZE
  },
  help: {
    type: 'boolean',
    short: 'h',
    default: false
  }
}

// parse command-line options
const { values, positionals } = parseArgs({ argv, options, allowPositionals: true })
if (values.db) {
  values.database = values.db
  delete values.db
}
if (values.buffer) {
  values.buffer = parseInt(values.buffer)
}

// help mode
if (values.help) {
  console.log(syntax)
  process.exit(0)
}

if (positionals.length > 1) {
  console.log('Too many filenames provided - maximum is one')
  console.log(syntax)
  process.exit(1)
}


const main = async () => {
  if (positionals.length === 1) {
    // we have a filename supplied
    try {
      console.log(`Opening file ${positionals[0]}`)
      const fd = await open(positionals[0])
      values.rs = fd.createReadStream({ encoding: 'utf8' })
    } catch {
      console.error('Could not open file')
      process.exit(2)
    }
  } else {
    console.log('Reading data from stdin')
  }
  const data = await couchimport(values)
  console.log('Import complete')
}
main()

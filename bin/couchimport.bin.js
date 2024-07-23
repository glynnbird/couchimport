#!/usr/bin/env node
const { parseArgs } = require('node:util')
const couchimport = require('../index.js')
const syntax =
`Syntax:
--url/-u           (COUCH_URL)           the URL of the CouchDB instance                     (required)
--database/--db/-d (COUCH_DATABASE)      CouchDB Datbase name                                (required)
--buffer/-b        (COUCH_BUFFER_SIZE)   # docs written per bulk write                       (default: 500)
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
const { values } = parseArgs({ argv, options })
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

const main = async () => {
  const data = await couchimport(values)
  console.log('Import complete')
}
main()

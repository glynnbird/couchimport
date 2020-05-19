const path = require('path')

const parse = function () {
  const argv = require('yargs')
    .option('url', {
      alias: 'u',
      describe: 'the URL of the CouchDB instance',
      default: process.env.COUCH_URL ? process.env.COUCH_URL : undefined,
      demandOption: !process.env.COUCH_URL
    })
    .option('database', {
      alias: ['db', 'd'],
      describe: 'the CouchDB database name',
      default: process.env.COUCH_DATABASE ? process.env.COUCH_DATABASE : undefined,
      demandOption: !process.env.COUCH_DATABASE
    })
    .option('delimiter', {
      describe: 'the CSV delimiter character',
      default: process.env.COUCH_DELIMITER ? process.env.COUCH_DELIMITER : '\t'
    })
    .option('transform', {
      describe: 'path to a JavaScript transformation function',
      default: process.env.COUCH_TRANSFORM ? process.env.COUCH_TRANSFORM : null
    })
    .option('meta', {
      alias: 'm',
      describe: 'a JSON object passed to the transformation function',
      default: process.env.COUCH_META ? process.env.COUCH_META : null
    })
    .option('buffer', {
      alias: 'b',
      number: true,
      describe: 'the number of documents written to CouchDB per HTTP bulk write',
      default: process.env.COUCH_BUFFER_SIZE ? parseInt(process.env.COUCH_BUFFER_SIZE) : 500
    })
    .option('parallelism', {
      number: true,
      describe: 'the number of HTTP requests to have in-flight at any one time',
      default: process.env.COUCH_PARALLELISM ? parseInt(process.env.COUCH_PARALLELISM) : 1
    })
    .option('maxwps', {
      number: true,
      describe: 'the maximum number of write operations to perform per second',
      default: process.env.MAX_WPS ? parseInt(process.env.MAX_WPS) : 0
    })
    .option('type', {
      alias: 't',
      describe: 'the type of file being imported',
      choices: ['text', 'json', 'jsonl'],
      default: process.env.COUCH_FILETYPE ? process.env.COUCH_FILETYPE : 'text'
    })
    .option('jsonpath', {
      alias: 'j',
      describe: 'the path into the incoming JSON document (type=json only)',
      default: process.env.COUCH_JSON_PATH ? process.env.COUCH_JSON_PATH : null
    })
    .option('preview', {
      alias: 'p',
      boolean: true,
      describe: 'if true, runs in preview mode',
      default: process.env.COUCH_PREVIEW ? (process.env.COUCH_PREVIEW === 'true') : false
    })
    .option('ignorefields', {
      alias: 'i',
      describe: 'a comma-separated list of fields to ignore',
      default: process.env.COUCH_IGNORE_FIELDS ? process.env.COUCH_IGNORE_FIELDS : null
    })
    .option('overwrite', {
      alias: 'o',
      boolean: true,
      describe: 'whether to overwrite existing revisions with supplied data',
      default: process.env.COUCH_OVERWRITE ? process.env.COUCH_OVERWRITE : false
    })
    .option('retry', {
      alias: 'r',
      boolean: true,
      describe: 'whether to retry requests that yield a HTTP 429 response',
      default: process.env.COUCH_RETRY ? process.env.COUCH_RETRY : false
    })
    .argv

  // load the transformation JavaScript
  if (argv.transform) {
    argv.transform = require(path.resolve(process.cwd(), argv.transform))
  }

  // parse the transformation meta
  if (argv.meta) {
    argv.meta = JSON.parse(argv.meta)
  }

  // split the ignored fields
  if (argv.ignorefields) {
    argv.ignorefields = argv.ignorefields.split(',')
  }

  return argv
}

module.exports = {
  parse: parse
}

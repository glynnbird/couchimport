var defaults = require('./defaults.js'),
  theconfig = defaults.get(),
  debug = require('debug')('couchimport'),
  path = require('path'),
  argv = require('minimist')(process.argv.slice(2));

// configure the CouchDB params
var types = ["text", "json", "jsonl"];

// if we have a custom CouchDB url
if (typeof process.env.COUCH_URL != "undefined") {
  theconfig.COUCH_URL = process.env.COUCH_URL;
}

// if we have a custom CouchDB url
if (typeof process.env.COUCH_DATABASE != "undefined") {
  theconfig.COUCH_DATABASE = process.env.COUCH_DATABASE;
}

// if we have a customised transformation function
if (typeof process.env.COUCH_TRANSFORM != "undefined") {
  theconfig.COUCH_TRANSFORM = require(path.resolve(process.cwd(), process.env.COUCH_TRANSFORM));
}

// if we have overridden the delimeter field
if (typeof process.env.COUCH_DELIMITER != "undefined") {
  theconfig.COUCH_DELIMITER = process.env.COUCH_DELIMITER;
}

// if there is metadata specified
if (typeof process.env.COUCHIMPORT_META != "undefined") {
  theconfig.COUCHIMPORT_META = JSON.parse(process.env.COUCHIMPORT_META);
}

// if there is type specified
if (typeof process.env.COUCH_FILETYPE == "string" && types.indexOf(process.env.COUCH_FILETYPE) != -1) {
  theconfig.COUCH_FILETYPE = process.env.COUCH_FILETYPE;
}

// if there is a buffer size specified
if (typeof process.env.COUCH_BUFFER_SIZE != "undefined") {
  theconfig.COUCH_BUFFER_SIZE = parseInt(process.env.COUCH_BUFFER_SIZE);
}

// if there is a buffer size specified
if (typeof process.env.COUCH_JSON_PATH != "undefined") {
  theconfig.COUCH_JSON_PATH = process.env.COUCH_JSON_PATH;
}

// if there is a parallelism specified
if (typeof process.env.COUCH_PARALLELISM != "undefined") {
  theconfig.COUCH_PARALLELISM = parseInt(process.env.COUCH_PARALLELISM);
}

// if this is preview mode
if (typeof process.env.COUCH_PREVIEW != "undefined") {
  theconfig.COUCH_PREVIEW = true;
}

// list of field names to ignore
if (typeof process.env.COUCH_IGNORE_FIELDS != "undefined") {
  theconfig.COUCH_IGNORE_FIELDS = process.env.COUCH_IGNORE_FIELDS.split(',');
}

// override with command-line parameters
if (argv.url) {
  theconfig.COUCH_URL = argv.url;
}
if (argv.db) {
  theconfig.COUCH_DATABASE = argv.db;
}
if (argv.database) {
  theconfig.COUCH_DATABASE = argv.database;
}
if (argv.transform) {
  theconfig.COUCH_TRANSFORM = require(path.resolve(process.cwd(), argv.transform))
}
if (argv.delimiter) {
  theconfig.COUCH_DELIMITER = argv.delimiter;
}
if (argv.meta) {
  theconfig.COUCHIMPORT_META = JSON.parse(argv.meta);
}
if (argv.type && types.indexOf(argv.type) != -1) {
  theconfig.COUCH_FILETYPE = argv.type;
}
if (argv.buffer) {
  theconfig.COUCH_BUFFER_SIZE = parseInt(argv.buffer);
}
if (argv.jsonpath) {
  theconfig.COUCH_JSON_PATH = argv.jsonpath;
}
if (argv.json-path) {
  theconfig.COUCH_JSON_PATH = argv.json-path;
}
if (argv.parallelism) {
  theconfig.COUCH_PARALLELISM = parseInt(argv.parallelism);
}
if (argv.preview) {
  theconfig.COUCH_PREVIEW = true;
}
if (argv.version) {
  theconfig.COUCHIMPORT_VERSION = true;
}
if (argv.ignorefields) {
  theconfig.COUCH_IGNORE_FIELDS = argv.ignorefields.split(',');
}

if(!theconfig.COUCHIMPORT_VERSION) {
    debug("******************");
    debug("configuration");
    debug(JSON.stringify(theconfig, null, ' ').replace(/\/\/.+@/g, "//****:****@"));
    debug("******************");
}

module.exports = theconfig;

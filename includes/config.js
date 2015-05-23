var theconfig = {};
var argv = require('minimist')(process.argv.slice(2));

// configure the CouchDB paramss
theconfig.COUCH_URL = "http://localhost:5984";
theconfig.COUCH_DATABASE = "test";
theconfig.COUCH_TRANSFORM = null;
theconfig.COUCH_DELIMITER = "\t";

// if we have a custom CouchDB url
if( typeof process.env.COUCH_URL != "undefined") {
  theconfig.COUCH_URL = process.env.COUCH_URL;
}

// if we have a custom CouchDB url
if( typeof process.env.COUCH_DATABASE != "undefined") {
  theconfig.COUCH_DATABASE = process.env.COUCH_DATABASE;
}

// if we have a customised transformation function
if( typeof process.env.COUCH_TRANSFORM != "undefined") {
  theconfig.COUCH_TRANSFORM = require(process.env.COUCH_TRANSFORM)
}

// if we have overridden the delimeter field
if( typeof process.env.COUCH_DELIMITER != "undefined") {
  theconfig.COUCH_DELIMITER = process.env.COUCH_DELIMITER;
}

// if there is metadata specified
if( typeof process.env.COUCHIMPORT_META != "undefined") {
  theconfig.COUCHIMPORT_META = JSON.parse(process.env.COUCHIMPORT_META);
}

// override with command-line parameters
if(argv.url) {
  theconfig.COUCH_URL = argv.url;
}
if(argv.db) {
  theconfig.COUCH_DATABASE = argv.db;
}
if(argv.transform) {
  theconfig.COUCH_TRANSFORM = require(argv.transform)
}
if(argv.delimiter) {
  theconfig.COUCH_DELIMITER = argv.delimiter;
}
if(argv.meta) {
  theconfig.COUCHIMPORT_META = argv.meta;
}


console.log("******************");
console.log(" COUCHIMPORT - configuration")
console.log("  ", JSON.stringify(theconfig, null, ' ').replace(/\/\/.+@/g, "//****:****@"));
console.log("******************")

module.exports = theconfig;

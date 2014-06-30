var theconfig = {};

// die if COUCH_URL or COUCHDB_DATABASE is unknown
if (typeof process.env.COUCH_URL == "undefined" || typeof process.env.COUCH_DATABASE == "undefined") {
  console.log("Requires environment variables COUCH_URL && COUCH_DATABASE")
  process.exit(1);
}

// configure the CouchDB paramss
theconfig.COUCH_URL = process.env.COUCH_URL;
theconfig.COUCH_DATABASE = process.env.COUCH_DATABASE;
theconfig.COUCH_TRANSFORM = null;

// if we have a customised transformation function
if( typeof process.env.COUCH_TRANSFORM != "undefined") {
  theconfig.COUCH_TRANSFORM = require(process.env.COUCH_TRANSFORM)
}

module.exports = theconfig;
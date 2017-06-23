#!/usr/bin/env node
process.env.DEBUG=(process.env.DEBUG)?process.env.DEBUG+",couchimport":"couchimport"
var debug = require('debug')('couchimport'),
  couchimport = require('../app.js'),
  config = require('../includes/config.js');

if(config.COUCHIMPORT_VERSION) {
  // if this is set, just print the version and exit
  var package_json = require('../package.json');
  console.log(package_json.version);
  process.exit();
} else if(config.COUCH_PREVIEW) {
  couchimport.previewStream(process.stdin, config, function(err, data, delimiter) {
    switch(delimiter) {
      case ',': console.log("Detected a COMMA column delimiter"); break;
      case '\t': console.log("Detected a TAB column delimiter"); break;
      default: console.log("Detected an unknown column delimiter"); break;
    }
    if (data && data.length > 0) {
      console.log(data[0]);
    }
  });
} else {
  // import data from a stdin  
  couchimport.importStream(process.stdin, config, function(err,data) {
    debug("Import complete");
  }).on("written", function(data) {
    debug("Written ok:" + data.documents + " - failed: " + data.failed + " -  (" + data.total + ")");
  }).on("writeerror", function(err) {
    debug("ERROR", err);
  });
}



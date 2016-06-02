#!/usr/bin/env node
process.env.DEBUG=(process.env.DEBUG)?process.env.DEBUG+",couchimport":"couchimport"
var debug = require('debug')('couchimport'),
  couchimport = require('../app.js'),
  config = require('../includes/config.js');
  
// import data from a stdin  
couchimport.importStream(process.stdin, config, function(err,data) {
  debug("Import complete");
}).on("written", function(data) {
  debug("Written ok:" + data.documents + " - failed: " + data.failed + " -  (" + data.total + ")");
}).on("writeerror", function(err) {
  debug("ERROR", err);
});
 


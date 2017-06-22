#!/usr/bin/env node
process.env.DEBUG=(process.env.DEBUG)?process.env.DEBUG+",couchexport":"couchexport"
var couchimport = require('../app.js');
var config = require('../includes/config.js');

if(config.COUCHIMPORT_VERSION) {
  // if this is set, just print the version and exit
  var package_json = require('../package.json');
  console.log(package_json.version);
  process.exit();
} else {
  couchimport.exportStream(process.stdout, config, function(err,data) {
  });
}
 

#!/usr/bin/env node
process.env.DEBUG=(process.env.DEBUG)?process.env.DEBUG+",couchexport":"couchexport"
var couchimport = require('../app.js');
var config = require('../includes/config.js');
couchimport.exportStream(process.stdout, config, function(err,data) {
});
 

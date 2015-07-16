#!/usr/bin/env node
process.env.DEBUG=(process.env.DEBUG)?process.env.DEBUG+",couchimport":"couchimport"
var couchimport = require('../app.js'),
 config = require('../includes/config.js');
couchimport.importStream(process.stdin, config, function(err,data) {
});
 


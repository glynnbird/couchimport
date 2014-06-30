var rs = process.stdin;
var os = process.stdout;
var liner = require('./includes/liner.js');
var writer = require('./includes/writer.js');
var objectifier = require('./includes/objectifier.js');
var transformer = require('./includes/transformer.js');
var cloudant = require('./includes/cloudant.js');


// die if COUCH_URL or COUCHDB_DATABASE is unknown
if (typeof process.env.COUCH_URL == "undefined" || typeof process.env.COUCH_DATABASE == "undefined") {
  console.log("Requires environment variables COUCH_URL && COUCH_DATABASE")
  process.exit(1);
}

// configure the CouchDB paramss
cloudant.config(process.env.COUCHDB_URL, process.env.COUCHDB_DATABASE);
   
// pipe the input to the output, via transformation functions
rs.pipe(liner)        // transform the input stream into per-line 
  .pipe(objectifier)  // turn each line into an object
//  .pipe(transformer)  // process each object
  .pipe(writer) // transform the data

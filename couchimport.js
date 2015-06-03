var rs = process.stdin,
  config = require('./includes/config.js'),
  writer = require('./includes/writer.js'),
  objectifier = require('./includes/objectifier.js'),
  transformer = require('./includes/transformer.js');


if(config.COUCH_FILETYPE == "json") {
  if(!config.COUCH_JSON_PATH) {
    console.error("ERROR: you must specify a JSON path using --jsonpath or COUCH_JSON_PATH");
    process.exit();
  }
  // pipe the file to a streaming JSON parser
  var JSONStream = require('JSONStream');
  rs.pipe(JSONStream.parse(config.COUCH_JSON_PATH))
    .pipe(transformer)  // process each object
    .pipe(writer); // write the data
} else {
  // pipe the input to the output, via transformation functions
  rs.pipe(objectifier)  // turn each line into an object
    .pipe(transformer)  // process each object
    .pipe(writer); // write the data
}


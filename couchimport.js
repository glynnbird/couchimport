var config = require('./includes/config.js');
  rs = process.stdin,
  liner = require('./includes/liner.js'),
  writer = require('./includes/writer.js'),
  objectifier = require('./includes/objectifier.js'),
  transformer = require('./includes/transformer.js'),
  cloudant = require('./includes/cloudant.js');
   
// pipe the input to the output, via transformation functions
rs.pipe(objectifier)  // turn each line into an object
  .pipe(transformer)  // process each object
  .pipe(writer) // transform the data

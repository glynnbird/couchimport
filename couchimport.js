var rs = process.stdin,
  writer = require('./includes/writer.js'),
  objectifier = require('./includes/objectifier.js'),
  transformer = require('./includes/transformer.js');
   
// pipe the input to the output, via transformation functions
rs.pipe(objectifier)  // turn each line into an object
  .pipe(transformer)  // process each object
  .pipe(writer) // transform the data

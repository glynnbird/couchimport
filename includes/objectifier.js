var config = require('./config.js'),
  parse = require('csv-parse');

module.exports = parse({delimiter: config.COUCH_DELIMITER, columns: true, skip_empty_lines: true, relax: true});

var stream = require('stream'),
  config = require('./config.js'),
	parse = require('csv-parse');

var headings = null;
var DELIMITER = config.COUCH_DELIMITER;

module.exports = parse({delimiter: DELIMITER,columns:true, skip_empty_lines:true});

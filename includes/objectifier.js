var stream = require('stream'),
  config = require('./config.js');

var headings = null;
var DELIMETER = config.COUCH_DELIMETER;

var objectifier = new stream.Transform( { objectMode: true } );

// take a line of text
objectifier._transform = function (line, encoding, done) {

  // remove /r character
  line = line.replace(/\r$/,"");


  // assume the first line is the headings
  if (headings == null) {
    // deal with quoted heading fields
    line = line.replace(/\'|\"/g, '');
    
    // store the headings for next time
    headings = line.split(DELIMETER);
    done();
  } else {

    // make an object with key value pairs using the headings as the key
    var bits = line.split(DELIMETER);
    var obj = { };
    for (var i in headings) {
      obj[headings[i]] = bits[i];
    }

    // pass the object to the next thing in the stream
    this.push(obj);
    done();
  }

};

module.exports = objectifier;

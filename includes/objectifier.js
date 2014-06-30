var stream = require('stream');

var headings = null;
var DELIMETER = "\t";

var objectifier = new stream.Transform( { objectMode: true } );
objectifier._transform = function (line, encoding, done) {

  // remove /r character
  line = line.replace(/\r$/,"");
  
  
  // assume the first line is the headings
  if (headings == null) {
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
    this.push(obj);
    done();
  }

};

module.exports = objectifier;
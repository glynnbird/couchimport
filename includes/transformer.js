var stream = require('stream');
var config = require('./config.js');


var transformer = new stream.Transform( { objectMode: true } );
transformer._transform = function (obj, encoding, done) {

  // transform using custom function
  if(config.COUCH_TRANSFORM) {
    obj = config.COUCH_TRANSFORM(obj);
  }
  
  // pass object to next stream handler
  this.push( obj);
  done();
};

module.exports = transformer;
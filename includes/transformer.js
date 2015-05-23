var stream = require('stream');
var config = require('./config.js');


var transformer = new stream.Transform( { objectMode: true } );
transformer._transform = function (obj, encoding, done) {
  // transform using custom function
  if(typeof config.COUCH_TRANSFORM == "function") {
    obj = config.COUCH_TRANSFORM(obj, config.COUCHIMPORT_META);
  }

  // pass object to next stream handler
  this.push( obj);
  done();
};

module.exports = transformer;

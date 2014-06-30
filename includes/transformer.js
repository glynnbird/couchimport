var stream = require('stream');


var transformer = new stream.Transform( { objectMode: true } );
transformer._transform = function (obj, encoding, done) {
//  console.log("**",obj);
  this.push( obj);
  done();
};

module.exports = transformer;
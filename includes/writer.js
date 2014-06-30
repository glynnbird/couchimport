var stream = require('stream');
var cloudant = require('./cloudant.js');

var buffer = [ ];
var BUFFER_MAX_SIZE = 500;
var written = 0;

// write the contents of the buffer to CouchDB in blocks of 500
var processBuffer = function(flush, callback) {
  
  if(flush || buffer.length>= BUFFER_MAX_SIZE) {
    var toSend = buffer.splice(0, buffer.length);
    buffer = [];
    cloudant.bulk_write(toSend, function(err, data) {
      written += toSend.length;
      console.log("Written", toSend.length, " (",written,")");
      callback();
    });
  } else {
    callback();
  }
}

var writer = new stream.Transform( { objectMode: true } );

// take an object
writer._transform = function (obj, encoding, done) {
    
  // add to the buffer
  buffer.push(obj);

  // optionally write to the buffer
  processBuffer(false,  function() {
    done();
  });

};

// called when we need to flush everything
writer._flush = function(done) {
  processBuffer(true, function() {
    done();
  })
}

module.exports = writer;
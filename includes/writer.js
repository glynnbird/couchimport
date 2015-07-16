var debug = require('debug')('couchimport');

module.exports = function(couch_url, couch_database, buffer_size) {
  
  var stream = require('stream'),
    buffer = [ ],
    written = 0;
    
  var cloudant = require('cloudant')(couch_url);
  var db = cloudant.db.use(couch_database);

  // write the contents of the buffer to CouchDB in blocks of 500
  var processBuffer = function(flush, callback) {
  
    if(flush || buffer.length>= buffer_size) {
      var toSend = buffer.splice(0, buffer.length);
      buffer = [];
      db.bulk({docs:toSend}, function(err, data) {
        if (err) {
          console.error("ERROR", err);
        } else {
          written += toSend.length;
          debug("Written", toSend.length, " (",written,")");
        }
        callback();
      });
    } else {
      callback();
    }
  }

  var writer = new stream.Transform( { objectMode: true } );

  // take an object
  writer._transform = function (obj, encoding, done) {
    
    // add to the buffer, if it's not an empty object
    if (Object.keys(obj).length>0) {
      buffer.push(obj);
    }

    // optionally write to the buffer
    this.pause();
    processBuffer(false,  function() {
      done();
    });

  };

  // called when we need to flush everything
  writer._flush = function(done) {
    processBuffer(true, function() {
      done();
    });
  };
  
  return writer;
};
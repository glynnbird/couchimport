var config = require('./config.js');
var nano = require('nano')( { url: config.COUCH_URL } );  
var startdocid = null,
  blocksize = 500;

var bulk_write = function(docs, callback) {
  var db = nano.use(config.COUCH_DATABASE);
  db.bulk({docs: docs}, function(err, data) {
    callback(err, data);
  });
};

var bulk_read = function(callback) {
  if(startdocid === false) {
    return callback("Done",null);
  }
  var docs = [];
  var opts = { limit: blocksize+1, include_docs:true };
  if (startdocid) {
    opts.startkey_docid = startdocid;
  }
  var db = nano.use(config.COUCH_DATABASE);
  db.list(opts, function(err, data) {
    if (err) {
      console.error("ERROR",err.statusCode, err.reason);
      return callback(err,null)
    }
    if (data.rows.length == blocksize+1) {
      startdocid = data.rows[blocksize].id
    } else {
      startdocid = false
    }
    
    var docs = [];
    for(var i=0; i < Math.min(data.rows.length, blocksize); i++) {
      delete data.rows[i].doc._rev
      docs.push(data.rows[i].doc);
    }
    callback(null, docs)
  })
};

module.exports = {
  bulk_write: bulk_write,
  bulk_read: bulk_read
}
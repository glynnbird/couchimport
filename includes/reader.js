module.exports = function(couch_url, couch_database, blocksize) {
  
  var cloudant = require('cloudant')(couch_url);
  var db = cloudant.db.use(couch_database);
  var startdocid = null;

  var bulk_read = function(callback) {
    if(startdocid === false) {
      return callback("Done",null);
    }
    var docs = [];
    var opts = { limit: blocksize+1, include_docs:true };
    if (startdocid) {
      opts.startkey_docid = startdocid;
    }
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
  
  return bulk_read;
  
};
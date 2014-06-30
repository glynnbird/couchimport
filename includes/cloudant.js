
var COUCHDB_DATABASE = null;
var nano = null;

var config = function( url, db) {
  nano = require('nano')({url:url});
  COUCHDB_DATABASE = db;
}

var bulk_write = function(docs, callback) {
  var db = nano.use(COUCHDB_DATABASE);
  db.bulk({docs: docs}, function(err, data) {
    callback(err, data);
  })
}
  


module.exports = {
  config: config,
  bulk_write: bulk_write
}
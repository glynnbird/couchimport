var config = require('./config.js');
var nano = require('nano')( { url: config.COUCH_URL } );  

var bulk_write = function(docs, callback) {
  var db = nano.use(config.COUCH_DATABASE);
  db.bulk({docs: docs}, function(err, data) {
    callback(err, data);
  })
}

module.exports = {
  bulk_write: bulk_write
}
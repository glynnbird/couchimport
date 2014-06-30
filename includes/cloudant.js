
var nano = null;
var config = require('./config.js');
console.log("USING ", config.COUCH_URL.replace(/.*@/,"*****"), config.COUCH_DATABASE);
nano = require('nano')( { url: config.COUCH_URL } );  

var bulk_write = function(docs, callback) {
  var db = nano.use(config.COUCH_DATABASE);
  db.bulk({docs: docs}, function(err, data) {
    callback(err, data);
  })
}

module.exports = {
  bulk_write: bulk_write
}
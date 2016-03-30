var nock = require('nock');
var URL = "http://localhost:5984";
var couchimport = require("../app.js");

console.log(couchimport);

var opts = { COUCH_DELIMITER: ",", COUCH_URL: URL, COUCH_DATABASE: "mydb", COUCH_BUFFER_SIZE:10 };

var couchdb = nock(URL)
                .post('/mydb/_bulk_docs')
                .reply(function(uri, body) {
                  console.log("Request!");
                  return [200, {}];
                });

                
    
    
describe('Input CSV file', function() {

  before(function() {
  });

  it('import a CSV file', function(done) {
    couchimport.importFile("./test/test.csv", opts, function(err,data) {
       console.log("done",err,data);
       done();
    });
  });

});

 
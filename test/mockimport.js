var nock = require('nock');
var URL = "http://localhost:5984";
var couchimport = require("../app.js");
var should = require('should');

var opts = { COUCH_DELIMITER: ",", COUCH_URL: URL, COUCH_DATABASE: "mydb", COUCH_BUFFER_SIZE:10 };

var couchdb = nock(URL)
                .post('/mydb/_bulk_docs')
                .reply(function(uri, body) {
                  var retval = [];
                  for (var i = 0; i < 99; i++) {
                    if (i % 2 ==0) {
                      var obj = {
                        id: i,
                        rev: i+"-abc123",
                        ok: true
                      };
                    } else {
                      var obj = {
                        id: i,
                        error: "conflict",
                        reason: "Document update conflict"
                      };
                    }

                    retval.push(obj);
                  }
                  return [200, retval];
                });

                
    
    
describe('Input CSV file', function() {

  before(function() {
  });

  it('import a CSV file', function(done) {
    couchimport.importFile("./test/test.csv", opts, function(err,data) {
      data.should.be.an.Object;
      data.should.have.a.property.total;
      data.should.have.a.property.totalfailed;
      data.total.should.be.a.Number;
      data.totalfailed.should.be.a.Number;
      data.total.should.equal(49);
      data.totalfailed.should.equal(50);
      done();
    });
  });

});

 
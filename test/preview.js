var couchimport = require("../app.js");
var assert = require('assert');
var should = require('should');

var opts = { COUCH_PREVIEW:true };

            
describe('Preview mode', function() { 

  it('preview csv', function(done) {
    couchimport.previewCSVFile("./test/test.csv", opts, function(err,data, delimiter) {
      assert.equal(err, null);
      data.should.be.an.Object;
      delimiter.should.be.a.String;
      delimiter.should.equal(",");
      done();
    });
  });

  if('preview tsv', function(done) {
    couchimport.previewCSVFile("./test/guitars.csv", opts, function(err,data, delimiter) {
      assert.equal(err, null);
      data.should.be.an.Object;
      delimiter.should.be.a.String;
      delimiter.should.equal("\t");
      done();
    });
  })

  if('preview nonsense', function(done) {
    couchimport.previewCSVFile("./test/guitars.csv", opts, function(err,data, delimiter) {
      assert.equal(err, null);
      data.should.be.an.Object;
      delimiter.should.be.a.String;
      delimiter.should.equal("\t");
      done();
    });
  });

});
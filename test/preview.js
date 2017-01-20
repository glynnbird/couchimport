var couchimport = require("../app.js");
var assert = require('assert');
var should = require('should');

var opts = { COUCH_PREVIEW:true };

            
describe('Preview mode', function() { 

  it('preview csv', function(done) {
    couchimport.previewCSVFile("./test/test.csv", opts, function(err,data, delimiter) {
      assert.equal(err, null);
      data.should.be.an.Array;
      delimiter.should.be.a.String;
      delimiter.should.equal(",");
      done();
    });
  });

  it('preview tsv', function(done) {
    couchimport.previewCSVFile("./test/guitars.tsv", opts, function(err,data, delimiter) {
      assert.equal(err, null);
      data.should.be.an.Array;
      delimiter.should.be.a.String;
      delimiter.should.equal("\t");
      done();
    });
  })

  it('preview tsv with transform', function(done) {
    opts.COUCH_TRANSFORM = function(doc) {
      doc.price = parseFloat(doc.price);
      return doc;
    };
    couchimport.previewCSVFile("./test/guitars.tsv", opts, function(err,data, delimiter) {
      assert.equal(err, null);
      data.should.be.an.Array;
      data[0].should.be.an.Object;
      data[0].price.should.be.a.Number;
      delimiter.should.be.a.String;
      delimiter.should.equal("\t");
      done();
    });
  })

  it('preview nonsense', function(done) {
    couchimport.previewCSVFile("./test/guitars.tsv", opts, function(err,data, delimiter) {
      assert.equal(err, null);
      data.should.be.an.Array;
      delimiter.should.be.a.String;
      delimiter.should.equal("\t");
      done();
    });
  });

});
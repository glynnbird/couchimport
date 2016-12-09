var should = require('should');

var COUCH_URL="https://myuser:mypassword@myaccount.server.com",
  MY_DATABASE = "mydatabase",
  MY_TRANSFORM = "./test/testtransform.js",
  MY_DELIMITER = "|",
  MY_META = JSON.stringify({a:"mymeta"}),
  MY_TYPE = "text",
  MY_BUFFER_SIZE = "1000",
  MY_JSON_PATH = "abc123",
  MY_PARALLELISM = 42,
  MY_IGNORE = "a,b";


describe('Command-line parameters', function() {
  
  before(function() {
   process.argv = [
                    "node", "couchimport.js", 
                     "--url", COUCH_URL,
                     "--db", MY_DATABASE,
                     "--transform", MY_TRANSFORM,
                     "--delimiter", MY_DELIMITER,
                     "--meta", MY_META,
                     "--type", MY_TYPE,
                     "--buffer", MY_BUFFER_SIZE,
                     "--jsonpath", MY_JSON_PATH,
                     "--parallelism", MY_PARALLELISM,
                     "--ignorefields", MY_IGNORE
                   ];
    
    config = require('../includes/config.js');
  });
  
  it('respects the url parameter', function(done) {
    config.COUCH_URL.should.be.a.String;
    config.COUCH_URL.should.equal(COUCH_URL);
    done();
  });
  
  it('respects the db parameter', function(done) {
    config.COUCH_DATABASE.should.be.a.String;
    config.COUCH_DATABASE.should.equal(MY_DATABASE);
    done();
  });
  
  it('respects the transform parameter', function(done) {
    config.COUCH_TRANSFORM.should.be.a.Function;
    done();
  });
  
  it('respects the delimiter parameter', function(done) {
    config.COUCH_DELIMITER.should.be.a.String;
    config.COUCH_DELIMITER.should.be.equal(MY_DELIMITER);
    done();
  });
  
  it('respects the meta parameter', function(done) {
    var str = JSON.stringify(config.COUCHIMPORT_META);
    str.should.be.equal(MY_META);
    done();
  });
  
  it('respects the type parameter', function(done) {
    config.COUCH_FILETYPE.should.be.a.String;
    config.COUCH_FILETYPE.should.be.equal(MY_TYPE);
    done();
  });
  
  it('respects the buffer parameter', function(done) {
    config.COUCH_BUFFER_SIZE.should.be.a.Number;
    config.COUCH_BUFFER_SIZE.should.be.equal(parseInt(MY_BUFFER_SIZE));
    done();
  });
  
  it('respects the jsonpath parameter', function(done) {
    config.COUCH_JSON_PATH.should.be.a.String;
    config.COUCH_JSON_PATH.should.be.equal(MY_JSON_PATH);
    done();
  });
  
  it('respects the parallelism parameter', function(done) {
    config.COUCH_PARALLELISM.should.be.a.Number;
    config.COUCH_PARALLELISM.should.be.equal(parseInt(MY_PARALLELISM));
    done();
  });

  it('respects the parallelism parameter', function(done) {
    config.COUCH_IGNORE_FIELDS.should.be.an.Object;
    config.COUCH_IGNORE_FIELDS.length.should.be.a.Number;
    config.COUCH_IGNORE_FIELDS.length.should.be.equal(2);
    done();
  });
  
  after(function() {
    delete require.cache[require.resolve('../includes/config.js')]
    
  })
});

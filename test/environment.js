var should = require('should');

var COUCH_URL="https://myuser:mypassword@myaccount.server2.com",
  MY_DATABASE = "mydatabase2",
  MY_TRANSFORM = "../test/testtransform.js",
  MY_DELIMITER = "&",
  MY_META = JSON.stringify({b:"mymeta"}),
  MY_TYPE = "json",
  MY_BUFFER_SIZE = "1001",
  MY_JSON_PATH = "abc1234",
  MY_PARALLELISM = 43;


describe('Command-line parameters', function() {
  
  before(function() {
    process.argv = ["node", "couchimport.js"];
    process.env.COUCH_URL = COUCH_URL;
    process.env.COUCH_DATABASE = MY_DATABASE;
    process.env.COUCH_TRANSFORM = MY_TRANSFORM;
    process.env.COUCH_DELIMITER = MY_DELIMITER;
    process.env.COUCHIMPORT_META = MY_META;
    process.env.COUCH_FILETYPE = MY_TYPE;
    process.env.COUCH_BUFFER_SIZE = MY_BUFFER_SIZE;
    process.env.COUCH_JSON_PATH = MY_JSON_PATH;
    process.env.COUCH_PARALLELISM = MY_PARALLELISM;
    
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
  
  after(function() {
    delete require.cache[require.resolve('../includes/config.js')]
    delete process.env.COUCH_URL;
    delete process.env.COUCH_DATABASE;
    delete process.env.COUCH_TRANSFORM;
    delete process.env.COUCH_DELIMITER;
    delete process.env.COUCHIMPORT_META;
    delete process.env.COUCH_FILETYPE;
    delete process.env.COUCH_BUFFER_SIZE;
    delete process.env.COUCH_JSON_PATH;
    delete process.env.COUCH_PARALLELISM;
    
  })
});

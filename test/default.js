var should = require('should'),
  defaults = require('../includes/defaults.js').get();

describe('Default parameters', function() {
  
  before(function() {
    process.env = {}
    process.argv = [
                    "node", "couchimport.js"
                   ];
    
    config = require('../includes/config.js');
  });
  
  it('respects the default url', function(done) {
    config.COUCH_URL.should.be.a.String;
    config.COUCH_URL.should.equal(defaults.COUCH_URL);
    done();
  });
  
  it('respects the default db', function(done) {
    config.COUCH_DATABASE.should.be.a.String;
    config.COUCH_DATABASE.should.equal(defaults.COUCH_DATABASE);
    done();
  });

  
  it('respects the default delimiter', function(done) {
    config.COUCH_DELIMITER.should.be.a.String;
    config.COUCH_DELIMITER.should.be.equal(defaults.COUCH_DELIMITER);
    done();
  });
  
  
  it('respects the default transform ', function(done) {
    should(config.COUCH_TRANSFORM).equal(null);
    done();
  });
  
  it('respects the default meta', function(done) {
    should(config.COUCH_META).equal(null);
    done();
  });
  
  it('respects the default type', function(done) {
    config.COUCH_FILETYPE.should.be.a.String;
    config.COUCH_FILETYPE.should.be.equal(defaults.COUCH_FILETYPE);
    done();
  });
  
  it('respects the default buffer size', function(done) {
    config.COUCH_BUFFER_SIZE.should.be.a.Number;
    config.COUCH_BUFFER_SIZE.should.be.equal(defaults.COUCH_BUFFER_SIZE);
    done();
  });
  
  it('respects the default jsonpath', function(done) {
    should(config.COUCH_JSON_PATH).equal(null);
    done();
  });
  
  it('respects the default parallelism', function(done) {
    config.COUCH_PARALLELISM.should.be.a.Number;
    config.COUCH_PARALLELISM.should.be.equal(defaults.COUCH_PARALLELISM);
    done();
  });

    it('respects the default parallelism', function(done) {
    config.COUCH_IGNORE_FIELDS.should.be.an.Object;
    config.COUCH_IGNORE_FIELDS.length.should.be.equal(0);
    done();
  });
  
  after( function() {
    config = null;
    delete require.cache[require.resolve('../includes/config.js')]
  })
  
});

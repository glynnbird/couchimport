var stream = require('stream');

module.exports = function(func, meta) {

  var transformer = new stream.Transform( { objectMode: true } );
  transformer._transform = function (obj, encoding, done) {
    var self = this

    // transform using custom function
    if(typeof func == "function") {
      obj = func(obj, meta);
    }

    // pass object to next stream handler
    if (Array.isArray(obj)) {
      obj.forEach(function (obj) {
        self.push( obj)
      })
    } else {
      this.push( obj);
    }

    done();
  };

  return transformer;
}

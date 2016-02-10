
var URL = require('url');
var parse = require('csv-parse');
var fs = require('fs');
var defaults = require('./defaults.js');


// preview a URL
var first10kURL = function(u, callback) {
  var b = new Buffer(0);
  var onceonly = false;
  
  var alldone = function() {
    console.log("ad");
    if (!onceonly) {
      var str = b.toString('utf8');
      console.log("str", str.length);
      onceonly = true;
      callback(null, str);
    }
  };
  
  var parsed = URL.parse(u);
  var agent = null;
  if (parsed.protocol == 'http:') {
    agent = require('http')
  } else if (parsed.protocol == 'https:') {
    agent = require('https')
  } else {
    return callback("Invalid protocol - " + parsed.protocol, null);
  }
  
  agent.get(u, function(rs) {
    rs.on('data', function (d) { 
        console.log("chunk", d.length)
        b = Buffer.concat([b,d]);
        if (b.length > 10000) {
          rs.destroy();
          alldone();
        }
      })
  })
    .on('error', alldone)
    .on('end', alldone);
};

var url = function(u, opts, callback) {
  // merge default options
  opts = defaults.merge(opts);
  
  first10kURL(u, function(err, data) {
    if (err) {
      return callback(err, null);
    }
    var lines = data.split("\n");
    str = lines.splice(0,4).join("\n") + "\n";
    parse(str, {delimiter: opts.COUCH_DELIMITER, columns: true, skip_empty_lines: true, relax: true}, callback)
  })
};

var file =  function(filename, opts, callback) { 
  
  // merge default options
  opts = defaults.merge(opts);
 
  fs.open(filename, 'r', function(status, fd) {
    if (status) {
      return callback(status.message, null);
    }
    var buffer = new Buffer(10000);
    fs.read(fd, buffer, 0, 10000, 0, function(err, num) {
      var str = buffer.toString('utf-8', 0, num);
      var lines = str.split("\n");
      str = lines.splice(0,4).join("\n") + "\n";
      fs.close(fd);
      parse(str, {delimiter: opts.COUCH_DELIMITER, columns: true, skip_empty_lines: true, relax: true}, callback)
    });
  });
};

module.exports = {
  file: file,
  url: url
}

var URL = require('url');
var parse = require('csv-parse');
var fs = require('fs');
var defaults = require('./defaults.js');

var analyseString = function(str, callback) {
  var lines = str.split("\n");
  str = lines.splice(0,4).join("\n") + "\n"
  var csv = parse(str, {delimiter: ',', columns: true, skip_empty_lines: true, relax: true}, function(err1, csvdata) {
     var tsv = parse(str, {delimiter: '\t', columns: true, skip_empty_lines: true, relax: true}, function(err2, tsvdata) {
          
        var delimiter = '?'; // unknown

        // look at CSV version
        if (!err1) {
          if (csvdata && csvdata.length>0 && Object.keys(csvdata[0]).length >1) {
            delimiter = ',';
            return callback(null, csvdata, delimiter);
          }
        }

        // look at TSV version
        if (!err2) {
          if (tsvdata && tsvdata.length>0 && Object.keys(tsvdata[0]).length >1) {
            delimiter = '\t';
            return callback(null, tsvdata, delimiter);
          }
        }
        // not sure what type of data it is
        return callback(null, '', delimiter)
    })
  });
}


// preview a URL
var first10kURL = function(u, callback) {
  var b = new Buffer(0);
  var onceonly = false;
  
  var alldone = function() {
    if (!onceonly) {
      var str = b.toString('utf8');
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
    analyseString(data, callback);
  })
};

var file =  function(filename, opts, callback) { 
  // merge default options
  opts = defaults.merge(opts);
  var rs = fs.createReadStream(filename, { encoding: 'utf8'});
  stream(rs, opts, callback);
};

var stream = function(rs, opts, callback) {
  var str = '';
  var calledback = false;

  rs.on('readable', function() {
    var str = '';
    while (null !== (chunk = rs.read())) {
      str += chunk.toString('utf8');
      if (chunk === null || str.length >=10000) {
        break;
      }
    }
    rs.destroy(rs);
    if (!calledback) {
      calledback = true;
      analyseString(str, function (err, data, delimiter) {

        // allow transformation in preview 
        if (opts.COUCH_TRANSFORM && typeof opts.COUCH_TRANSFORM === 'function') {
          var func = opts.COUCH_TRANSFORM;
          for (var i in data) {
            data[i] = func(data[i], opts.COUCH_META);
          }
        }

        callback(err, data, delimiter);

      });
    }
  }).on('error', function(e) {
    if (!calledback) {
      callback(e, null, '?');
    }
  });
};

module.exports = {
  file: file,
  url: url,
  stream: stream
}
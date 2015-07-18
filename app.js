var fs = require('fs'),
  async = require('async'),
  debugimport = require('debug')('couchimport'),
  debugexport = require('debug')('couchexport'),
  defaults = require('./includes/defaults.js');


// import a file stream into CouchDB 
// rs - readable stream
// opts - an options object, or null for defaults
// callback - called when complete
var importStream = function(rs, opts, callback) {
  
  // sort the paramters
  if (typeof callback == "undefined" && typeof opts == "function") {
    callback = opts;
    opts = null;
  }
  
  // merge default options
  opts = defaults.merge(opts);

  // load dependencies
  var writer = require('./includes/writer.js')(opts.COUCH_URL, opts.COUCH_DATABASE, opts.COUCH_BUFFER_SIZE),
      transformer = require('./includes/transformer.js')(opts.COUCH_TRANSFORM, opts.COUCH_META);
  
  // if this is a JSON stream
  if (opts.COUCH_FILETYPE == "json") {
    
    if (!opts.COUCH_JSON_PATH) {
      var msg = "ERROR: you must specify a JSON path using --jsonpath or COUCH_JSON_PATH";
      debugimport(msg);
      return callback(msg, null);
    }
    // pipe the file to a streaming JSON parser
    var JSONStream = require('JSONStream');
    rs.pipe(JSONStream.parse(opts.COUCH_JSON_PATH))
      .pipe(transformer)  // process each object
      .pipe(writer); // write the data
      
  } else {

    // load the CSV parser
    var parse = require('csv-parse'),
      objectifier = parse({delimiter: opts.COUCH_DELIMITER, columns: true, skip_empty_lines: true, relax: true});
    
    // pipe the input to the output, via transformation functions
    rs.pipe(objectifier)  // turn each line into an object
      .pipe(transformer)  // process each object
      .pipe(writer); // write the data
  }
  
  writer.on('finish', function() {
    callback(null, null);
  });
  
  rs.on('error', function(e) {
    callback(e, null);
  });
  
};

// import a named file into CouchDB 
// filename - name of the file stream
// opts - an options object, or null for defaults
// callback - called when complete
var importFile = function(filename, opts, callback) {
  importStream(fs.createReadStream(filename), opts, callback);
};

// export to a writable stream
// ws - writable stream
// opts - an options object, or null for defaults
// callback - called when complete
var exportStream = function (ws, opts, callback) {
  var escape = null;
  
  // sort the paramters
  if (typeof callback == "undefined" && typeof opts == "function") {
    callback = opts;
    opts = null;
  }
  
  // merge default options
  opts = defaults.merge(opts);
  
  var total = 0,
    headings = [],
    lastsize = 0,
    reader = require('./includes/reader.js')(opts.COUCH_URL, opts.COUCH_DATABASE, opts.COUCH_BUFFER_SIZE);

  // export a row as a CSV
  var exportAsCSV = function(row) {
  
    // ignore design docs
    if (row._id.match(/^_design/)) {
      return;
    }
  
    // if we are extracting headings
    if (headings.length ==0) {
      headings = Object.keys(row);
      ws.write(headings.join(opts.COUCH_DELIMITER) + "\n");
    }
  
    // output columns
    var cols = [];
    for(var i in headings) {
      var v = row[headings[i]];
      var t = typeof v;
      if (v == null) {
        cols.push("null");
      } else if (t == "undefined") {
        cols.push("");
      } else if (t == "string") {
        cols.push(v);
      } else {
        cols.push(v.toString());
      }
    }
    ws.write(cols.join(opts.COUCH_DELIMITER) + "\n");
  }

  async.doUntil(function(callback){
    reader(function(err, data) {
      if(err) {
        return callback(true);
      }
      lastsize = data.length;
      total += lastsize;
      for (var i in data) {
        exportAsCSV(data[i]);
      }
      debugexport("Output", data.length, "[" + total + "]");
      callback(null);
    });
  },
  function() {
    return (lastsize == 0 || escape);
  }, 
  function(err){
    debugexport("Output complete");
    callback(escape, null);
  });
  
  ws.on("error", function(err) {
    escape = err;
  });
  
};

// export to a named file 
// filename - name of the file stream
// opts - an options object, or null for defaults
// callback - called when complete
var exportFile = function(filename, opts, callback) {
  exportStream(fs.createWriteStream(filename), opts, callback);
};

// load the first 10k of a file and parse the first 3 lines
// filename - name of the file to load
// opts - an options object, or null for defaults
// callback - called when complete
var previewCSVFile = function(filename, opts, callback) {
 
  var parse = require('csv-parse');
  
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
  importStream: importStream,
  importFile: importFile,
  exportStream: exportStream,
  exportFile: exportFile,
  previewCSVFile: previewCSVFile
}
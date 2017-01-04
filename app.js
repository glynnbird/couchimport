var fs = require('fs'),
  async = require('async'),
  _ = require('underscore'),
  debugimport = require('debug')('couchimport'),
  debugexport = require('debug')('couchexport'),
  defaults = require('./includes/defaults.js'),
  preview = require('./includes/preview.js');

// import a file stream into CouchDB 
// rs - readable stream
// opts - an options object, or null for defaults
// callback - called when complete
var importStream = function (rs, opts, callback) {

  // sort the paramters
  if (typeof callback == "undefined" && typeof opts == "function") {
    callback = opts;
    opts = null;
  }

  // merge default options
  opts = defaults.merge(opts);

  // load dependencies
  var writer = require('./includes/writer.js')(opts.COUCH_URL, opts.COUCH_DATABASE, opts.COUCH_BUFFER_SIZE, opts.COUCH_PARALLELISM, opts.COUCH_IGNORE_FIELDS),
    transformer = require('./includes/transformer.js')(opts.COUCH_TRANSFORM, opts.COUCH_META);

  if (opts.COUCH_FILETYPE == "jsonl") {
    // pipe the file to a streaming JSON parser
    var JSONStream = require('JSONStream');
    rs.pipe(JSONStream.parse())
      .pipe(transformer)  // process each object
      .pipe(writer); // write the data
  }
  else if (opts.COUCH_FILETYPE == "json") {
    // if this is a JSON stream
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
      objectifier = parse({ delimiter: opts.COUCH_DELIMITER, columns: true, skip_empty_lines: true, relax: true });

    // pipe the input to the output, via transformation functions
    rs.pipe(objectifier)  // turn each line into an object
      .pipe(transformer)  // process each object
      .pipe(writer); // write the data
  }

  writer.on('writecomplete', function (data) {
    debugimport('writecomplete', data);
    callback(null, data);
  });

  rs.on('error', function (e) {
    debugimport('error', e);
    callback(e, null);
  });

  return writer;
};

// import a named file into CouchDB 
// filename - name of the file stream
// opts - an options object, or null for defaults
// callback - called when complete
var importFile = function (filename, opts, callback) {
  return importStream(fs.createReadStream(filename), opts, callback);
};

var strip = function (str) {
  return str.replace(/\n/g, ' ').replace(/\r/g, '');
}

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
  var exportAsCSV = function (row) {

    // ignore design docs
    if (row._id.match(/^_design/)) {
      return;
    }

    // if we are extracting headings
    if (headings.length == 0) {
      headings = Object.keys(row);
      opts.COUCH_IGNORE_FIELDS.forEach(function (f) {
        headings = _.without(headings, f);
      });
      ws.write(headings.join(opts.COUCH_DELIMITER) + "\n");
    }

    // output columns
    var cols = [];
    for (var i in headings) {
      var v = row[headings[i]];
      var t = typeof v;
      if (v == null) {
        cols.push("null");
      } else if (t == "undefined") {
        cols.push("");
      } else if (t == "string") {
        cols.push(strip(v));
      } else {
        cols.push(v.toString());
      }
    }
    ws.write(cols.join(opts.COUCH_DELIMITER) + "\n");
  }

  async.doUntil(function (callback) {
    reader(function (err, data) {
      if (err) {
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
    function () {
      return (lastsize == 0 || escape);
    },
    function (err) {
      debugexport("Output complete");
      callback(escape, null);
    });

  ws.on("error", function (err) {
    escape = err;
  });

};

// export to a named file 
// filename - name of the file stream
// opts - an options object, or null for defaults
// callback - called when complete
var exportFile = function (filename, opts, callback) {
  exportStream(fs.createWriteStream(filename), opts, callback);
};

// load the first 10k of a file and parse the first 3 lines
// filename - name of the file to load
// opts - an options object, or null for defaults
// callback - called when complete
var previewCSVFile = preview.file;

// load the first 10k of a URL and parse the first 3 lines
// URL - name of the file to load
// opts - an options object, or null for defaults
// callback - called when complete
var previewURL = preview.url;


// load the first 10k of a URL and parse the first 3 lines
// URL - name of the file to load
// opts - an options object, or null for defaults
// callback - called when complete
var previewStream = preview.stream;

module.exports = {
  importStream: importStream,
  importFile: importFile,
  exportStream: exportStream,
  exportFile: exportFile,
  previewCSVFile: previewCSVFile,
  previewURL: previewURL,
  previewStream: previewStream
}
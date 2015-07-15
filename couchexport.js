var cloudant = require('./includes/cloudant.js'),
  config = require('./includes/config.js'),
  async = require('async'),
  total = 0,
  headings = [],
  lastsize = 0;

var exportAsCSV = function(row) {
  
  // ignore design docs
  if (row._id.match(/^_design/)) {
    return;
  }
  
  // if we are extracting headings
  if (headings.length ==0) {
    headings = Object.keys(row);
    console.log(headings.join(config.COUCH_DELIMITER));
    return;
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
  console.log(cols.join(config.COUCH_DELIMITER));
}

async.doUntil(function(callback){
  cloudant.bulk_read(function(err, data) {
    if(err) {
      return callback(true);
    }
    lastsize = data.length;
    total += lastsize;
    for (var i in data) {
      exportAsCSV(data[i]);
    }
    console.error("Output",data.length);
    callback(null);
  });
},
function() {
  return (lastsize == 0);
}, 
function(err){
  console.error("");
  console.error("Done");
});


var defaults = {
  COUCH_URL: "http://localhost:5984",
  COUCH_DATABASE: "test",
  COUCH_DELIMITER:  "\t",
  COUCH_FILETYPE: "text",
  COUCH_BUFFER_SIZE:  500,
  COUCH_JSON_PATH: null,
  COUCH_TRANSFORM: null,
  COUCH_META: null,
  COUCH_PARALLELISM: 1,
  COUCH_PREVIEW: false,
  COUCH_IGNORE_FIELDS: []
};

var get = function() {
  return JSON.parse(JSON.stringify(defaults)); 
};

var merge = function(myopts) {
  if(myopts == null) {
    return get(); 
  }
  for(var i in defaults) {
    if (typeof myopts[i] == "undefined") {
      myopts[i] = defaults[i];
    }
  }
  return myopts;
}

module.exports = {
  get: get,
  merge: merge
};


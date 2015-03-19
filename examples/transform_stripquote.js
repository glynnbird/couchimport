// example transformation function
// -- remove leading and trailing quotes
var x = function(doc) {
  for(var i in doc) { 
    var v = doc[i];
    v = v.replace(/^"/,"");
    v = v.replace(/"$/,"");
    doc[i] = v;
  }
  return doc;
}

module.exports = x;

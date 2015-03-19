// example transformation function
// -- remove leading and trailing quotes
var x = function(doc) {
  for(var i in doc) { 
    var v = doc[i];
    v = v.replace(/^"/,"");
    v = v.replace(/"$/,"");
    doc[i] = v;
  }
  
  doc.price = parseInt(doc.price, 10);
  doc.new = (doc.new=="N")?true:false;
  return doc;
}

module.exports = x;

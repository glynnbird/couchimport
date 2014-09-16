// example transformation function
// -- each function takes a "doc" and should return a doc, synchronously
var x = function(doc) {
  if(typeof doc.is_duplicate && doc.is_duplicate=="1") {
    doc.is_duplicate = true;
  } else {
    doc.is_duplicate = false;
  } 
  return doc;
}

module.exports = x;

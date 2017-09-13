// example transformation function
// -- split a row into multiple docs
var x = function(row) {
  var doc1 = {
    _id: row.id,
    name: row.name,
    type: 'person'
  }
  var doc2 = {
    _id: row.company_id,
    name: row.company_name,
    type: 'company'
  }
  for(var i in doc) {
    var v = doc[i];
    v = v.replace(/^"/,"");
    v = v.replace(/"$/,"");
    doc[i] = v;
  }
  return [doc1, doc2];
}

module.exports = x;

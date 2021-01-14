// example transformation function
// -- split a row into multiple docs
const x = function (row) {
  const doc1 = {
    _id: row.id,
    name: row.name,
    type: 'person'
  }
  const doc2 = {
    _id: row.company_id,
    name: row.company_name,
    type: 'company'
  }
  return [doc1, doc2]
}

module.exports = x

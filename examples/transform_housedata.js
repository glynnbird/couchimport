// example transformation function
// -- remove leading and trailing quotes
const x = function (doc) {
  for (const i in doc) {
    let v = doc[i]
    v = v.replace(/^"/, '')
    v = v.replace(/"$/, '')
    doc[i] = v
  }

  doc.price = parseInt(doc.price, 10)
  doc.new = (doc.new === 'N')
  return doc
}

module.exports = x

const defaults = {
  url: 'http://localhost:5984',
  database: 'test',
  delimiter: '\t',
  type: 'text',
  buffer: 500,
  jsonpath: null,
  transform: null,
  meta: null,
  parallelism: 1,
  preview: false,
  ignorefields: []
}

const get = function () {
  return JSON.parse(JSON.stringify(defaults))
}

const merge = function (myopts) {
  if (myopts == null) {
    return get()
  }
  for (const i in defaults) {
    if (typeof myopts[i] === 'undefined') {
      myopts[i] = defaults[i]
    }
  }
  return myopts
}

module.exports = {
  get: get,
  merge: merge
}

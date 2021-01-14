/* global describe it before */
const nock = require('nock')
const URL = 'http://localhost:5984'
const couchimport = require('../app.js')
const assert = require('assert')

describe('Export CSV file', function () {
  before(function () {
  })

  it('export a CSV file', function (done) {
    const opts = { delimiter: ',', url: URL, database: 'mydb', buffer: 8, since: '0' }
    const path = require('path')
    const fs = require('fs')
    const reply = fs.readFileSync(path.join(__dirname, 'changes.json'))
    const reply2 = fs.readFileSync(path.join(__dirname, 'changes2.json'))
    const ref = fs.readFileSync(path.join(__dirname, 'ref.csv'))
    const scope = nock(URL)
      .post('/mydb/_changes')
      .query({ feed: 'longpoll', since: '0', limit: 8, timeout: 0, include_docs: true })
      .reply(200, reply)
      .post('/mydb/_changes')
      .query({ feed: 'longpoll', timeout: 0, since: '8-g1AAAAaJeJy11dtNwzAUBmBDkRBPdAN4BSkldtxcnugGsAH4-NgqVZsg2jzDBrABbAAbwAawAWwAGxQbV6RRVSkXeEmkXL5f9m8nY0JId9hBcoAgsys1QOA9mHhSevnUm2b5bOhR2pPjLEeRznqpmo3NK5uCwO58Ph8NO4JMzIVtraWO_T6SnTxFpS9ShWWWVWGha46wt5A3fmSMYwqJqmPZ5MPfp83NKtH7NvqoNCiFAQgZrx9UXEn2rXxckhNkHFmwXq7UAgysfFKSI-ozpNC2iFMrn5Vk8HkUiBW59kSfWzpb0Jtu9SRRSDWrhTVp4tJGX5ebABklTLZsIt0yR3JjTga_LRavSnzOdFLHa9CWS79z6ffF2EIJqMPWjTn-wfGPxeDMxgwVg_9uzcU_ufjnpQ-DkjQwi72G17jZF5f-Wswt5Ur3I9Zynzn9zenvhe5zETNUf9Pch-M_lz4SKLRSK3yjYr6cvrybecC5_RdU90bfC04NwA', limit: 8, include_docs: true })
      .delay(1000)
      .reply(200, reply2)

    couchimport.exportFile('/tmp/test.csv', opts, function (err, data) {
      assert.strictEqual(err, null)
      const result = fs.readFileSync('/tmp/test.csv')
      assert.strictEqual(result.toString(), ref.toString())
      assert(scope.isDone())
      done()
    })
  })

  after(function () {
    nock.cleanAll()
  })
})

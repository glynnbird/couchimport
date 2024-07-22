#!/usr/bin/env node
const couchimport = require('../app.js')
const argv = require('../includes/args.js').parse()

couchimport.exportStream(process.stdout, argv, function (err, data) {
  if (err) {
    console.error('Error', err)
  }
})

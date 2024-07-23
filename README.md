# couchimport

## Introduction

When populating CouchDB databases, often the source of the data is initially some JSON documents in a file, or some structured CSV/TSV data from another database's export.

*couchimport* is designed to assist with importing such data into CouchDb efficiently. Simply pipe a file full of JSON documents into *couchimport*, telling the URL and database to send the data to.

> Note: `couchimport` used to handle the CSV to JSON conversion, but this part is now handled by [csvtojsonlines](https://www.npmjs.com/package/csvtojsonlines), keeping this package smaller and easier to maintain. The `couchimport@1.6.5` package is the last version to support CSV/TSV natively - from 2.0 onwards, `couchimport` is only for pouring JSONL files into CouchDB.

## Installation

Install using npm or another Node.js package manager:

```sh
npm install -g couchimport
```

*couchimport*'s configuration parameters can be stored in environment variables or supplied as command line arguments.

## Configuration - environment variables

Simply set the `COUCH_URL` environment variable e.g. for a hosted Cloudant database

```sh
export COUCH_URL="https://myusername:myPassw0rd@myhost.cloudant.com"
```

and define the name of the CouchDB database to write to by setting the `COUCH_DATABASE` environment variable e.g.

```sh
export COUCH_DATABASE="mydatabase"
```

Simply pipe the text data into "couchimport":

```sh
cat mydata.jsonl | couchimport
```

## Configuring - command-line options

Supply the `--url` and `--database` parameters as command-line parameters instead:

```sh
cat mydata.jsonl | couchimport --url "http://user:password@localhost:5984" --database "mydata"
```

## Handling CSV/TSV data

We can use another package [csvtojsonlines](https://www.npmjs.com/package/csvtojsonlines) to convert CSV/TSV files into a JSONL stream acceptable to `couchimport`:

```sh
# CSV file ----> JSON lines ---> CouchDB
cat transactions.csv | csvtojsonlines --delimiter ',' | couchimport --db ledger
```

## Generating random data

_couchimport_ can be paired with [datamaker](https://www.npmjs.com/package/datamaker) to generate any amount of sample data:

```sh
# template ---> datamaker ---> 100 JSON docs ---> couchimport ---> CouchDB
echo '{"_id":"{{uuid}}","name":"{{name}}","email":"{{email true}}","dob":"{{date 1950-01-01}}"}' | datamaker -f json -i 100 | couchimport --db people
written {"docCount":100,"successCount":1,"failCount":0,"statusCodes":{"201":1}}
Import complete
```

## Environment variables

* COUCH_URL - the url of the CouchDB instance (required, or to be supplied on the command line)
* COUCH_DATABASE - the database to deal with (required, or to be supplied on the command line)
* COUCH_BUFFER_SIZE - the number of records written to CouchDB per bulk write (defaults to 500, not required)

## Command-line parameters

You can also configure `couchimport` using command-line parameters:

* `--help` - show help
* `--url`/`-u` - the url of the CouchDB instance (required, or to be supplied in the environment)
* `--database`/`--db`/`-d` - the database to deal with (required, or to be supplied in the environment)
* `--buffer`/`-b` - the number of records written to CouchDB per bulk write (defaults to 500, not required)

## Using programmatically

In your project, add `couchimport` into the dependencies of your package.json or run `npm install couchimport`. In your code, require
the library with

```js
const couchimport = require('couchimport')
```

and your options are set in an object whose keys are the same as the COUCH_* environment variables:

e.g.

```js
const opts = { url: "http://localhost:5984", database: "mydb", rs: fs.createReadStream('myfile.json') }
await couchimport(opts)
```

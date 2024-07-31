# couchimport

## Introduction

When populating CouchDB databases, often the source of the data is initially some JSON documents in a file, or some structured CSV/TSV data from another database's export.

*couchimport* is designed to assist with importing such data into CouchDb efficiently. Simply pipe a file full of JSON documents into *couchimport*, telling the URL and database to send the data to.

> Note: `couchimport` used to handle the CSV to JSON conversion, but this part is now handled by [csvtojsonlines](https://www.npmjs.com/package/csvtojsonlines), keeping this package smaller and easier to maintain. The `couchimport@1.6.5` package is the last version to support CSV/TSV natively - from 2.0 onwards, `couchimport` is only for pouring JSONL files into CouchDB.

> Also note: the companion CSV export utility (couchexport) is now hosted at [couchcsvexport](https://www.npmjs.com/package/couchcsvexport).

## Installation

Install using npm or another Node.js package manager:

```sh
npm install -g couchimport
```

## Usage

_couchimport_ can either read JSON docs (one per line) from _stdin_ e.g.

```sh
cat myfile.json | couchimport
```

or by passing a filename as the last parameter:

```sh
couchimport myfile.json
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
couchimport --url "http://user:password@localhost:5984" --database "mydata" mydata.jsonl
```

or by piping data into _stdin_:

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
written {"batch":1,"batchSize":100,"docSuccessCount":100,"docFailCount":0,"statusCodes":{"201":1},"errors":{}}
Import complete
```

or with the template as a file:

```sh
cat template.json | datamaker -f json -i 10000 | couchimport --db people
```

## Understanding errors

We know if we get an HTTP 4xx/5xx response, then all of the documents failed to be written to the database. But as _couchimport_ is writing data in bulk, the bulk request may get an HTTP 201 response that doesn't mean that _all_ of the documents were written. Some of the document ids may have been in the database already. So the _couchimport_ output includes counts of the number of documents that were written successfully and the number that failed, and a tally of the HTTP response codes and individual document error messages:

e.g.

```js
written {"batch":10,"batchSize":1,"docSuccessCount":4,"docFailCount":6,"statusCodes":{"201":10},"errors":{"conflict":6}}
```

The above log line shows that after the tenth batch of writes, we have written 4 documents and failed to write 6 others. There were six "conflict" errors, meaning that there was a clash of document id or id/rev combination.

## Parallel writes

Older versions of _couchimport_ supported the ability to have multiple HTTP requests in flight at any one time, but the new simplified _couchimport_ does not. To achieve the same thing, simply split your file of JSON docs into smaller pieces and run multiple _couchimport_ jobs:

```sh
# split large file into files 1m lines each
# this will create files xaa, xab, xac etc
split -l 1000000 massive.txt
# find all files starting with x and using xargs,
# spawn a max of 2 process at once running couchimport, 
# one for each file
find . -name "x*" | xargs -t -I % -P 2 couchimport --db test %
```

## Environment variables reference

* COUCH_URL - the url of the CouchDB instance (required, or to be supplied on the command line)
* COUCH_DATABASE - the database to deal with (required, or to be supplied on the command line)
* COUCH_BUFFER_SIZE - the number of records written to CouchDB per bulk write (defaults to 500, not required)
* IAM_API_KEY - to use IBM IAM to do authentication, set the IAM_API_KEY to your api key and a bearer token will be used in the HTTP requests.

## Command-line parameters reference

You can also configure `couchimport` using command-line parameters:

* `--help` - show help
* `--url`/`-u` - the url of the CouchDB instance (required, or to be supplied in the environment)
* `--database`/`--db`/`-d` - the database to deal with (required, or to be supplied in the environment)
* `--buffer`/`-b` - the number of records written to CouchDB per bulk write (defaults to 500, not required)

## Using programmatically

In your project, add `couchimport` into the dependencies of your package.json or run `npm install --save couchimport`. In your code, require the library with

```js
const couchimport = require('couchimport')
```

and your options are set in an object whose keys are the same as the command line paramters:

e.g.

```js
const opts = { url: "http://localhost:5984", database: "mydb", rs: fs.createReadStream('myfile.json') }
await couchimport(opts)
```

> Note: `rs` is the readstream where data will be read (default: `stdin`) and `ws` is the write stream where the output will be written (default: `stdout`)

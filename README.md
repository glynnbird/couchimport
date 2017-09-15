# CouchImport

[![Build Status](https://travis-ci.org/glynnbird/couchimport.svg?branch=master)](https://travis-ci.org/glynnbird/couchimport) [![npm version](https://badge.fury.io/js/couchimport.svg)](https://badge.fury.io/js/couchimport)

## Introduction

When populating CouchDB databases, often the source of the data is initially a CSV or TSV file. CouchImport is designed to assist you with importing flat data into CouchDB efficiently.
It can be used either as command-line utilities `couchimport` and `couchexport` or the underlying functions can be used programatically:

* simply pipe the data file to 'couchimport' on the command line
* handles tab or comma separated data
* uses Node.js's streams for memory efficiency
* plug in a custom function to add your own changes before the data is written
* writes the data in bulk for speed
* can also write huge JSON files using a streaming JSON parser
* allows multiple writes to happen at once using the `--parallelism` option

![schematic](https://github.com/glynnbird/couchimport/raw/master/images/couchimport.png "Schematic Diagram")

## Installation

Requirements
* node.js
* npm

```
  sudo npm install -g couchimport
```

## Configuration

CouchImport's configuration parameters can be stored in environment variables or supplied as command line arguments.

### The location of CouchDB - default "http://localhost:5984"

Simply set the "COUCH_URL" environment variable e.g. for a hosted Cloudant database

```
  export COUCH_URL="https://myusername:myPassw0rd@myhost.cloudant.com"

```
or a local CouchDB installation:

```
  export COUCH_URL="http://localhost:5984"
```

### The name of the database - default "test"

Define the name of the CouchDB database to write to by setting the "COUCH_DATABASE" environment variable e.g.

```
  export COUCH_DATABASE="mydatabase"
```

### Transformation function - default nothing

Define the path of a file containing a transformation function e.g.

```
  export COUCH_TRANSFORM="/home/myuser/transform.js"
```

The file should:
* be a javascript file
* export one function that takes a single doc and returns a single object or
  an array of objects if you need to split a row into multiple docs.

(see examples directory). N.B it's best to use full paths for the transform function.

### Delimiter - default "\t"

The define the column delimiter in the input data e.g.

```
  export COUCH_DELIMITER=","
```

## Running

Simply pipe the text data into "couchimport":

```
  cat ~/test.tsv | couchimport
```

This example downloads public crime data, unzips and imports it:

```
  curl 'http://data.octo.dc.gov/feeds/crime_incidents/archive/crime_incidents_2013_CSV.zip' > crime.zip
  unzip crime.zip
  export COUCH_DATABASE="crime_2013"
  export COUCH_DELIMITER=","
  ccurl -X PUT /crime_2013
  cat crime_incidents_2013_CSV.csv | couchimport
```

In the above example we use "(ccurl)[https://github.com/glynnbird/ccurl]" a command-line utility that uses the same environment variables as "couchimport".

## Output

The following output is visible on the console when "couchimport" runs:

```
******************
 COUCHIMPORT - configuration
   {"COUCH_URL":"https://****:****@myhost.cloudant.com","COUCH_DATABASE":"aaa","COUCH_TRANSFORM":null,"COUCH_DELIMITER":","}
******************
Written 500  ( 500 )
Written 500  ( 1000 )
Written 500  ( 1500 )
Written 500  ( 2000 )
.
.

```

The configuration, whether default or overriden by environment variables or command line arguments, is shown.  This is followed by a line of output for each block of 500 documents written, plus a cumulative total.

## Preview mode

If you want to see a preview of the JSON that would be created from your csv/tsv files then add `--preview true` to your command-line:

```
    > cat text.txt | couchimport --preview true
    Detected a TAB column delimiter
    { product_id: '1',
      brand: 'Gibson',
      type: 'Electric',
      range: 'ES 330',
      sold: 'FALSE' }
```

As well as showing a JSON preview, preview mode also attempts to detect the column delimiter character for you.

## Importing large JSON documents

If your source document is a GeoJSON text file, `couchimport` can be used. Let's say your JSON looks like this:

```
{ "features": [ { "a":1}, {"a":2}] }
```

and we need to import each feature object into CouchDB as separate documents, then this can be imported using the `type="json"` argument and specifying the JSON path using the `json-path` argument:

```
  cat myfile.json | couchimport --database mydb --type json --jsonpath "features.*"
``` 

## Importing JSON Lines file

If your source document is a [JSON Lines](http://jsonlines.org/) text file, `couchimport` can be used. Let's say your JSON Lines looks like this:

```
{"a":1}
{"a":2}
{"a":3}
{"a":4}
{"a":5}
{"a":6}
{"a":7}
{"a":8}
{"a":9}
```

and we need to import each line as a JSON object into CouchDB as separate documents, then this can be imported using the `type="jsonl"` argument:

```
  cat myfile.json | couchimport --database mydb --type jsonl
```

## Importing a stream of JSONs

If your source data is a lot of JSON objects meshed or appended together, `couchimport` can be used. Let's say your file:

```
{"a":1}{"a":2}  {"a":3}{"a":4}
{"a":5}          {"a":6}
{"a":7}{"a":8}



{"a":9}
```

and we need to import each JSON objet to CouchDB as separate documents, then this can be imported using the `type="jsonl"` argument:

```
  cat myfile.json.blob | couchimport --database mydb --type jsonl
```

## Environment variables

* COUCH_URL - the url of the CouchDB instance (required, or to be supplied on the command line)
* COUCH_DATABASE - the database to deal with (required, or to be supplied on the command line)
* COUCH_DELIMITER - the delimiter to use (default '\t', not required)
* COUCH_TRANSFORM - the path of a transformation function (not required)
* COUCHIMPORT_META - a json object which will be passed to the transform function (not required)
* COUCH_BUFFER_SIZE - the number of records written to CouchDB per bulk write (defaults to 500, not required)
* COUCH_FILETYPE - the type of file being imported, either "text", "json" or "jsonl" (defaults to "text", not required)
* COUCH_JSON_PATH - the path into the incoming JSON document (only required for COUCH_FILETYPE=json imports)
* COUCH_PREVIEW - run in preview mode
* COUCH_IGNORE_FIELDS - a comma-separated list of field names to ignore on import or export e.g. price,url,image

## Command-line parameters

You can also configure `couchimport` and `couchexport` using command-line parameters:

* --version - simply prints the version and exits
* --url - the url of the CouchDB instance (required, or to be supplied in the environment)
* --database (or --db) - the database to deal with (required, or to be supplied in the environment)
* --delimiter - the delimiter to use (default '\t', not required)
* --transform - the path of a transformation function (not required)
* --meta - a json object which will be passed to the transform function (not required)
* --buffer - the number of records written to CouchDB per bulk write (defaults to 500, not required)
* --type - the type of file being imported, either "text", "json" or "jsonl" (defaults to "text", not required)
* --json-path - the path into the incoming JSON document (only required for type=json imports)
* --preview - if 'true', runs in preview mode
* --ignorefields - a comma-separated list of fields to ignore input or output

e.g.

```
    cat test.csv | couchimport --database  bob --delimiter ","
```

## couchexport

If you have structured data in a CouchDB or Cloudant that has fixed keys and values e.g.

```
{
    "_id": "badger",
    "_rev": "5-a9283409e3253a0f3e07713f42cd4d40",
    "wiki_page": "http://en.wikipedia.org/wiki/Badger",
    "min_weight": 7,
    "max_weight": 30,
    "min_length": 0.6,
    "max_length": 0.9,
    "latin_name": "Meles meles",
    "class": "mammal",
    "diet": "omnivore",
    "a": true
}
```

then it can be exported to a CSV like so (note how we set the delimiter):

```
    couchexport --url http://localhost:5984 --database animaldb --delimiter "," > test.csv
```
or to a TSV like so (we don't need to specify the delimiter since tab `\t` is the default):

```
    couchexport --url http://localhost:5984 --database animaldb > test.tsv
```


N.B.

* design documents are ignored
* the first non-design document is used to define the headings
* if subsequent documents have different keys, then unexpected things may happen
* COUCH_DELIMITER or --delimiter can be used to provide a custom column delimiter (not required when tab-delimited)
* if your document values contain carriage returns or the column delimiter, then this may not be the tool for you


## Using programmatically

In your project, add `couchimport` into the dependencies of your package.json or run `npm install couchimport`. In your code, require
the library with

```
    var couchimport = require('couchimport');
```

and your options are set in an object whose keys are the same as the COUCH_* environment variables:

e.g.

```
   var opts = { COUCH_DELIMITER: ",", COUCH_URL: "http://localhost:5984", COUCH_DATABASE: "mydb" };
```

To import data from a readable stream (rs):

```
    var rs = process.stdin;
    couchimport.importStream(rs, opts, function(err,data) {
       console.log("done");
    });
```

To import data from a named file:

```
    couchimport.importFile("input.txt", opts, function(err,data) {
       console.log("done",err,data);
    });
```

To export data to a writable stream (ws):

```
   var ws = process.stdout;
   couchimport.exportStream(ws, opts, function(err, data) {
     console.log("done",err,data);
   });
```


To export data to a named file:

```
   couchimport.exportFile("output.txt", opts, function(err, data) {
      console.log("done",err,data);
   });
```

To preview a file:

```
    couchimport.previewCSVFile('./hp.csv', opts, function(err, data, delimiter) {
      console.log("done", err, data, delimiter);
    });
```

To preview a CSV/TSV on a URL:

```
    couchimport.previewURL('https://myhosting.com/hp.csv', opts, function(err, data) {
      console.log("done", err, data, delimiter);  
    });
```

## Monitoring an import

Both `importStream` and `importFile` return an EventEmitter which emits

* `written` event on a successful write
* `writeerror` event when a complete write operation fails
* `writecomplete` event after the last write has finished
* `writefail` event when an individual line in the CSV fails to be saved as a doc

e.g.

```
couchimport.importFile("input.txt", opts, function(err,data) {
  console.log("done",err,data);
}).on("written", function(data) {
  // data = { documents: 500, failed:6, total: 63000, totalfailed: 42}
});
````

The emitted data is an object containing:

* documents - the number of documents written in the last batch
* total - the total number of documents written so far
* failed - the number of documents failed to write in the last batch
* totalfailed - the number of documents that failed to write in total

## Parallelism

Using the `COUCH_PARALLELISM` environment variable or the `--parallelism` command-line option, couchimport can
be configured to write data in multiple parallel operations. If you have the networkbandwidth, this can significantly
speed up large data imports e.g.

```
  cat bigdata.csv | couchimport --database mydb --parallelism 10 --delimiter ","
```

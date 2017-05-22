# spike-records-loadDir

[![Greenkeeper badge](https://badges.greenkeeper.io/smuemd/spike-records-loadDir.svg)](https://greenkeeper.io/) [![Coverage Status](https://coveralls.io/repos/github/smuemd/spike-records-loadDir/badge.svg?branch=master)](https://coveralls.io/github/smuemd/spike-records-loadDir?branch=master)

Load a directory of local data files in yaml or json format into [spike-records](https://github.com/static-dev/spike-records)

This module loads (merges) all yaml or json files within a given directory (and subdirectories) into a single data object (viewDat). This data object is updated with preference for the last merge over the first one. The recursive merge is implemented with [lodash](https://lodash.com/docs#merge).

## Installation

```bash
npm i spike-records -S
npm i spike-records-loadir -S
```

## Usage in [spike's](https://github.com/static-dev/spike) app.js

```js
const standard = require('reshape-standard')
const Records = require('spike-records')
const Datadir = require('spike-records-loaddir');
const locals = {}

// Create a config instance
var dataDir = new Datadir();

// Add all the JSON and YAML files in a directory
dataDir.source('path/to/your/data/directory');

// Add merged data object to spike-records
module.exports = {
  reshape: (ctx) => standard({ locals }),
  plugins: [new Records({
    addDataTo: locals,
    myData: { data: dataDir.get() }
  })]
}
```

## API

### new Datadir()

Constructor of a data instance.

```js
var dataDir = new Datadir();
```

### get(path)

Retrieve the data object.

```js
// Get the fully merged data as an object
datadir.get();
```

### source(path)

Loads a data file (if path targets a file), a set of data files located in a directory (if path targets a directory)

**NOTE**: If path targets a directory, the library merges any da file located in the directory, including subdirectory recursion.

It supports json and yaml  files which are identified by the file extension.

```js
// Add all the JSON and YAML files in a directory
dataDir.source('path/to/your/data/directory');
```

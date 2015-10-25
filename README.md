Node.js - klaw
==============

A Node.js file system walker extracted from [fs-extra](https://github.com/jprichardson/node-fs-extra).

[![build status](https://api.travis-ci.org/jprichardson/node-klaw.svg)](http://travis-ci.org/jprichardson/node-klaw)
[![windows build status](https://ci.appveyor.com/api/projects/status/github/jprichardson/node-klaw?branch=master&svg=true)](https://ci.appveyor.com/project/jprichardson/node-klaw/branch/master)


Install
-------

    npm i --save klaw


Name
----

`klaw` is `walk` backwards :p


Usage
-----

### klaw(directory, [options])

Returns a [Readable stream](https://nodejs.org/api/stream.html#stream_class_stream_readable) that iterates
through every file and directory starting with `dir` as the root. Every `read()` or `data` event
returns an object with two properties: `path` and `stats`. `path` is the full path of the file and
`stats` is an instance of [fs.Stats](https://nodejs.org/api/fs.html#fs_class_fs_stats).

- `directory`: The directory to recursively walk. Type `string`.
- `options`: Right now it's just Readable stream options.

**Streams 1 (push) example:**

```js
var klaw = require('klaw')

var items = [] // files, directories, symlinks, etc
klaw(TEST_DIR)
  .on('data', function (item) {
    items.push(item.path)
  })
  .on('end', function () {
    console.dir(items) // => [ ... array of files]
  })
```

**Streams 2 & 3 (pull) example:**

```js
var klaw = require('klaw')

var items = [] // files, directories, symlinks, etc
klaw('/some/dir')
  .on('readable', function () {
    var item
    while ((item = this.read())) {
      items.push(item.path)
    }
  })
  .on('end', function () {
    console.dir(items) // => [ ... array of files]
  })
```

If you're not sure of the differences on Node.js streams 1, 2, 3 then I'd
recommend this resource as a good starting point: https://strongloop.com/strongblog/whats-new-io-js-beta-streams3/.


### Error Handling

Listen for the `error` event.

Example:

```js
var klaw = require('klaw')
klaw('/some/dir')
  .on('readable', function () {
    var item
    while ((item = this.read())) {
      // do something with the file
    }
  })
  .on('error', function (err, item) {
    console.log(err.message)
    console.log(item.path) // the file the error occurred on
  })
  .on('end', function () {
    console.dir(items) // => [ ... array of files]
  })

```


### Filtering

On many occasions you may want to filter files based upon size, extension, etc.
You should use the module [`through2`](https://www.npmjs.com/package/through2) to easily
accomplish this.

Example (skipping directories):

first:

    npm i --save through2


```js
var fs = require('fs-extra')
var through2 = require('through2')

var excludeDirFilter = through2.obj(function (item, enc, next) {
  if (!item.stat.isDirectory()) this.push(item)
  next()
})

var items = [] // files, directories, symlinks, etc
klaw(TEST_DIR)
  .pipe(excludeDirFilter)
  .on('data', function (item) {
    items.push(item.path)
  })
  .on('end', function () {
    console.dir(items) // => [ ... array of files without directories]
  })

```


License
-------

MIT

Copyright (c) 2015 [JP Richardson](https://github.com/jprichardson)

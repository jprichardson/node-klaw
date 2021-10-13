const { strictEqual } = require('assert')
const path = require('path')
const fs = require('fs')
const { Readable } = require('stream')

class Walker extends Readable {
  /**
   * @param {string} dir
   * @param {Object} options
   */
  constructor (dir, options) {
    strictEqual(typeof dir, 'string', '`dir` parameter should be of type string. Got type: ' + typeof dir)
    options = {
      queueMethod: 'shift',
      pathSorter: undefined,
      filter: undefined,
      depthLimit: undefined,
      preserveSymlinks: false,
      pathCustom: undefined,
      ...options,
      objectMode: true
    }

    super(options)
    this.pathCustom = options.pathCustom || path
    this.root = this.pathCustom.resolve(dir)
    this.paths = [this.root]
    this.options = options
    if (options.depthLimit > -1) { this.rootDepth = this.root.split(this.pathCustom.sep).length + 1 }
    this.fs = options.fs || fs
  }

  _read () {
    if (this.paths.length === 0) { return this.push(null) }
    const pathItem = this.paths[this.options.queueMethod]()

    const statFunction = this.options.preserveSymlinks ? this.fs.lstat : this.fs.stat

    statFunction(pathItem, (err, stats) => {
      const item = { path: pathItem, stats: stats }
      if (err) { return this.emit('error', err, item) }

      if (!stats.isDirectory() || (this.rootDepth &&
        pathItem.split(this.pathCustom.sep).length - this.rootDepth >= this.options.depthLimit)) {
        return this.push(item)
      }

      this.fs.readdir(pathItem, (err, pathItems) => {
        if (err) {
          this.push(item)
          return this.emit('error', err, item)
        }
        const pathCustom = this.pathCustom;

        pathItems = pathItems.map(function (part) { return pathCustom.join(pathItem, part) })
        if (this.options.filter) { pathItems = pathItems.filter(this.options.filter) }
        if (this.options.pathSorter) { pathItems.sort(this.options.pathSorter) }
        // faster way to do do incremental batch array pushes
        this.paths.push.apply(this.paths, pathItems)

        this.push(item)
      })
    })
  }
}

/**
 * @param {string} root
 * @param {Object} [options]
 */
function walk (root, options) {
  return new Walker(root, options)
}

module.exports = walk

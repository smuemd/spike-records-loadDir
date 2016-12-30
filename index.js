// https://github.com/Telefonica/node-merge-config/blob/master/lib/configuration.js
// http://stackoverflow.com/questions/10049557/reading-all-files-in-a-directory-store-them-in-objects-and-send-the-object
// http://stackoverflow.com/questions/31365296/get-all-json-files-from-node-folder-and-find-specific-attr-inside

var glob = require('glob')
var path = require('path')
var fs = require('fs')
var jsyaml = require('js-yaml')
var _ = require('lodash')

function Datadir () {
  var viewDat = {}

  /**
   * Get the view data object.
   * @return {Object}
   *    view data object resulting from merging local files and / or directories.
   */
  function get () {
    return viewDat
  }

  /**
   * Merge a local data file: either a json (with .json extension) or yaml (with either .yml or .yaml extension).
   *
   * @param {String} configFile
   *    Path to the configuration file.
   */
  function loadFile (filePath) {
    var mergeObj
    var fileExtension = path.extname(filePath)

    switch (fileExtension) {

      case '.yml':
      case '.yaml':
        try {
          var yamlData = jsyaml.safeLoad(
            fs.readFileSync(filePath, 'utf8'), { json: false }
          )
          if (yamlData.view && yamlData.data) {
            mergeObj = {}
            mergeObj[yamlData.view] = yamlData.data
            // console.log(filePath, ': found data => merging into viewDat')
          } else { mergeObj = yamlData }
        } catch (e) { console.log(e) }
        break

      case '.json':
        try {
          var jsonData = JSON.parse(
            fs.readFileSync(filePath, 'utf8')
          )
          if (jsonData.view && jsonData.data) {
            mergeObj = {}
            mergeObj[jsonData.view] = jsonData.data
            // console.log(filePath, ': found data => merging into viewDat')
          } else { mergeObj = jsonData }
        } catch (e) { console.log(e) }
        break

      default:
        console.log(filePath, ': no yaml or json file')
        break
    }
    mergeObj ? _.merge(viewDat, mergeObj) : console.log(filePath, ': no data merge')
  }

 /**
  * Merge a local data directory by merging all the data files in the directory
  * and sub directories.
  *
  * @param {String} configDir
  *    Path to the configuration directory.
  */
  function loadDir (dirPath) {
    // var items = fs.readdirSync(dirPath)
    var yamlFiles = glob.sync(path.join(dirPath, '**/*.y*ml'))
    var jsonFiles = glob.sync(path.join(dirPath, '**/*.json'))
    var items = yamlFiles.concat(jsonFiles)
    // console.log(items.sort())
    items.sort().forEach(function (itemPath) {
      // var itemPath = path.join(dirPath, item)
      var itemStats = fs.statSync(itemPath)
      if (itemStats.isFile()) {
        // console.log('file: ', itemPath)
        loadFile(itemPath)
      }
      if (itemStats.isDirectory()) {
        console.log('directory: ', itemPath)
        // loadDir(itemPath)
      }
    })
  }

  /**
   * Merge data from a local data file, or from  multiple data files inside a
   * directory and subdirectories. It supports either JSON files (*.json) or
   * YML files (*.yaml / *.yml).
   *
   * @param {String} filePath
   *    Path to the configuration file or configuration directory.
   */
  function source (string) {
    var sourcePath = path.normalize(string)

    try {
      var stats = fs.statSync(sourcePath)
      if (stats.isDirectory()) {
        loadDir(sourcePath)
      } else if (stats.isFile()) {
        loadFile(sourcePath)
      } else if (!fs.existsSync(sourcePath)) {
        console.log('error: path not valid')
      }
    } catch (e) {
      console.log('Error:', e)
    }
  }

  return {
    source: source,
    get: get
  }
}

/**
 * Export Viewdata class.
 */
module.exports = Datadir

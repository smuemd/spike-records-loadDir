// https://github.com/Telefonica/node-merge-config/blob/master/lib/configuration.js
// http://stackoverflow.com/questions/10049557/reading-all-files-in-a-directory-store-them-in-objects-and-send-the-object
// http://stackoverflow.com/questions/31365296/get-all-json-files-from-node-folder-and-find-specific-attr-inside

const glob = require('glob')
const path = require('path')
const fs = require('fs')
const jsyaml = require('js-yaml')
const slugify = require('slugify')
const matter = require('gray-matter')

function DataSource () {
  const files = []

  /**
   * Get the array of data objects or get single data object.
   * @return {Array}
   * @return {Object}
   *    Array of data objects resulting from parsing
   *    local .yaml, .json and .md files and / or directories.
   */
  function get () {
    if (files.length === 1) {
      return files[0]
    } else {
      return files
    }
  }

  /**
   * Load and parse a local data file
   * Store data extracted from parsed file as an object in the data array.
   *
   * @param {String} filePath
   *    Path to the data file.
   *    Expexts file with .md, yaml, .yml, or .json file extension
   */
  function loadFile (filePath) {
    var file
    var fileExtension = path.extname(filePath)

    switch (fileExtension) {
      case '.yml':
      case '.yaml':
        try {
          file = jsyaml.safeLoad(fs.readFileSync(filePath, 'utf8'), {
            json: false
          })
        } catch (e) {
          console.log(e)
        }
        break

      case '.json':
        try {
          file = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        } catch (e) {
          console.log(e)
        }
        break

      case '.md':
        try {
          file = matter(fs.readFileSync(filePath, 'utf8'), { excerpt_separator: '<!-- end-excerpt -->' })
        } catch (e) {
          console.log(e)
        }
        break

      default:
        console.log(filePath, ': no yaml, json or markdown file')
        break
    }
    // Always add file meta info to file.data
    if (!file.data) {
      file['data'] = {}
    }
    file.data['_path'] = filePath
    file.data['_fileName'] = path.basename(filePath)
    file.data['_slug'] = slugify(path.basename(filePath, fileExtension))

    // Add path and slug properties to fileData object
    files.push(file)
  }

  /**
  * Load a directory with data files.
  * Create array with file paths of all .y*ml, json, and .md files found in the directory
  * and its subdirectories.
  *
  * @param {String} configDir
  *    Path to the directory containing data files.
  */
  function loadDir (dirPath) {
    // var items = fs.readdirSync(dirPath)
    var yamlFiles = glob.sync(path.join(dirPath, '**/*.y*ml'))
    var jsonFiles = glob.sync(path.join(dirPath, '**/*.json'))
    var markdownFiles = glob.sync(path.join(dirPath, '**/*.md'))
    var items = markdownFiles.concat(jsonFiles, yamlFiles)

    items.sort().forEach(function (itemPath) {
      var itemStats = fs.statSync(itemPath)
      if (itemStats.isFile()) {
        loadFile(itemPath)
      }
      if (itemStats.isDirectory()) {
        loadDir(itemPath)
      }
    })
  }

  /**
   * Merge data from a local data file, or from  multiple data files inside a
   * directory and its subdirectories. Expects eitehr .md, .json, or .yaml or .yml files.
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
      }
      if (stats.isFile()) {
        loadFile(sourcePath)
      }
      if (!fs.existsSync(sourcePath)) {
        console.log('error: path not valid')
      }
    } catch (e) {
      console.log('Error:', e)
    }
    var res = files.length === 1 ? files[0] : files
    return res
  }

  return {
    source: source,
    get: get
  }
}

/**
 * Export Viewdata class.
 */
module.exports = DataSource

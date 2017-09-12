const test = require('ava')
const fs = require('fs')
const glob = require('glob')
const DataSrc = require('../lib')
const path = require('path')

// test
test('read and parse markdown files', t => {
  let mdFrontMatter = new DataSrc()
  let mdNoFrontMatter = new DataSrc()
  let mdFrontMatterNoBody = new DataSrc()

  mdFrontMatter.source('./test/fixtures/baseDir/subDir/lang-yaml.md')
  mdFrontMatter.file = mdFrontMatter.get()
  t.deepEqual(
    typeof mdFrontMatter.file,
    'object',
    'single data objects should not be returned as array'
  )
  t.deepEqual(mdFrontMatter.file.data.title, 'YAML')

  mdNoFrontMatter.source('./test/fixtures/baseDir/subDir/no-front-matter.md')
  mdNoFrontMatter.file = mdNoFrontMatter.get()
  t.deepEqual(
    mdNoFrontMatter.file.data._path,
    'test/fixtures/baseDir/subDir/no-front-matter.md',
    'hast data attribute _pathset'
  )
  t.deepEqual(
    mdNoFrontMatter.file.data._fileName,
    'no-front-matter.md',
    'hast data attribute _fileName set'
  )
  t.deepEqual(
    mdNoFrontMatter.file.data._fileName,
    'no-front-matter.md',
    'has data attribute _fileName set'
  )
  t.deepEqual(
    mdNoFrontMatter.file.data._slug,
    'no-front-matter',
    'has data attribute _slug set'
  )

  mdFrontMatterNoBody.source('./test/fixtures/baseDir/subDir/missing-body.md')
  mdFrontMatterNoBody.file = mdFrontMatterNoBody.get()
  t.deepEqual(
    Object.keys(mdFrontMatterNoBody.file).length,
    2,
    'object should not have data and content attributes'
  )
  t.deepEqual(
    mdFrontMatterNoBody.file.content,
    '',
    'object content attribute should be empty string'
  )
})

test('read and parse yaml files', t => {
  let yaml = new DataSrc()
  let yml = new DataSrc()

  yaml.source('./test/fixtures/baseDir/subDir/test.yaml')
  yaml.file = yaml.get()
  t.deepEqual(
    yaml.file.data._path,
    'test/fixtures/baseDir/subDir/test.yaml',
    'should have standard data attrs'
  )
  t.is(yaml.file.types[0].name, 'Grass')

  yml.source('./test/fixtures/baseDir/subDir/zombies.yml')
  yml.file = yml.get()
  t.is(
    Object.keys(yml.file).length,
    4,
    'should also parse files w/ yml extension'
  )
})

test('read and parse json files', t => {
  let json = new DataSrc() // TODO: rename DataSrc to DataSource

  json.source('./test/fixtures/baseDir/subDir/pet-of-the-day.json')
  json.file = json.get()
  t.is(
    Object.keys(json.file).length,
    5,
    'should parse files w/ json extension and add data attr'
  )
})

test('read and parse single directory', t => {
  let subDirSubDir = new DataSrc()
  subDirSubDir.source('./test/fixtures/baseDir/subDir/subDirSubDir')
  subDirSubDir.data = subDirSubDir.get()
  t.deepEqual(
    subDirSubDir.data.length,
    fs.readdirSync('./test/fixtures/baseDir/subDir/subDirSubDir').length - 1,
    'does only parse .yaml, .json and .md files'
  )

  // TODO later
  subDirSubDir.data.forEach(function (file) {
    let output = path.relative(
      path.join(process.cwd(), '/test/fixtures'),
      path.join(
        path.dirname(file.data._path),
        [file.data._slug, '.html'].join('')
      )
    )
    return output
  })
  t.pass()
})

test('read and parse nested directories', t => {
  let baseDir = new DataSrc()
  baseDir.source('./test/fixtures/baseDir')
  baseDir.data = baseDir.get()

  var yamlFiles = glob.sync(path.join('./test/fixtures/baseDir', '**/*.y*ml'))
  var jsonFiles = glob.sync(path.join('./test/fixtures/baseDir', '**/*.json'))
  var markdownFiles = glob.sync(path.join('./test/fixtures/baseDir', '**/*.md'))
  var items = markdownFiles.concat(jsonFiles, yamlFiles)

  t.true(Array.isArray(baseDir.data), 'should be an array')
  t.deepEqual(
    baseDir.data.length,
    items.length,
    'should parse all yaml, json an md files also in subdirectories'
  )

  baseDir.data.forEach(function (file) {
    t.true(
      file.hasOwnProperty('data'),
      "obj in data array allways has 'data' attribute."
    )
    t.true(
      file.data.hasOwnProperty('_path'),
      "obj.data allways has '_path' attribute."
    )
  })
})

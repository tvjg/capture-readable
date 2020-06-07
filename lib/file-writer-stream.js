const path = require('path')
const { writeFile: _writeFile } = require('fs')
const _mkdirp = require('mkdirp')
const highland = require('highland')
const { promisify } = require('bluebird')

const { pipeline, map, merge } = highland
const writeFile = promisify(_writeFile)
const mkdirp = promisify(_mkdirp)

async function writeContent ({ filename, content }) {
  const dir = path.dirname(filename)

  await mkdirp(dir)
  await writeFile(filename, content)

  return filename
}

module.exports = pipeline(
  map(writeContent),
  map(highland),
  merge()
)

const path = require('path')
const { URL } = require('url')
const ReadabilityStream = require('./lib/readability-stream')
const fileWriterStream = require('./lib/file-writer-stream')

const captureReadable = (urlStream) =>
  urlStream
    .split()
    .compact()
    .through(ReadabilityStream.create())
    .map(generateFileContent)
    .through(fileWriterStream)
    .map((p) => `${p}\n`)

function generateFileContent ({ uri, title, content }) {
  let url = new URL(uri.spec, uri.prePath)
  let dir = path.join(url.host, encodeURIComponent(url.pathname.slice(1)))
  let base = `${Date.now()}.readable.html`
  let filename = path.format({ dir, base })

  return {
    filename,
    content: `${title}\n${content}`
  }
}

module.exports = captureReadable

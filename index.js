const path = require('path')
const { URL } = require('url')
const { pipeline, split, compact, through, map } = require('highland')
const ReadabilityStream = require('./lib/readability-stream')
const fileWriterStream = require('./lib/file-writer-stream')

const prepareFileStream = ({ outputDirectory }) =>
  ({ uri, title, content }) => {
    let url = new URL(uri.spec, uri.prePath)
    let dir = path.join(outputDirectory, url.host, encodeURIComponent(url.pathname.slice(1)))
    let base = `${Date.now()}.readable.html`
    let filename = path.format({ dir, base })

    return {
      filename,
      content: `${title}\n${content}`
    }
  }

const create = (opts) =>
  pipeline(
    split(),
    compact(),
    through(ReadabilityStream.create(opts)),
    map(prepareFileStream(opts)),
    through(fileWriterStream),
    map((p) => `${p}\n`)
  )

module.exports = { create }

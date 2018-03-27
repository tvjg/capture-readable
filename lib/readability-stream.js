const bluebird = require('bluebird')
const highland = require('highland')
const PuppetPool = require('./puppet-pool')
const buildScriptInjector = require('./file-injector')

const { pipeline, map, mergeWithLimit, errors } = highland
const { resolve, using } = bluebird
const injectReadabilityIntoPage = buildScriptInjector(require.resolve('readability'))

function create () {
  let poolSize = 5
  let pool = PuppetPool.create({ poolSize })

  let articlePipeline = pipeline(
    map((url) => {
      let browser = PuppetPool.borrow(pool)
      return using(browser, (browser) => fetchReadableArticle(browser, url))
    }),
    map(highland),
    mergeWithLimit(poolSize),
    errors((err, push) => console.error(err))
  )

  articlePipeline.observe().done(() => PuppetPool.destroy(pool))

  return articlePipeline
}

function fetchReadableArticle (browser, url) {
  return resolve(browser.newPage())
    .tap((page) => page.goto(url))
    .tap(injectReadabilityIntoPage)
    .call('evaluate', parseReadableArticle)
}

function parseReadableArticle () {
  let { Readability } = window
  let { href, origin, protocol, host } = document.location
  let uri = {
    spec: href,
    host: host,
    prePath: origin,
    scheme: protocol.substr(0, protocol.indexOf(':')),
    pathBase: href.substr(0, href.lastIndexOf('/') + 1)
  }

  return new Readability(uri, document).parse()
}

module.exports = { create }

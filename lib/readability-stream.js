const bluebird = require('bluebird')
const highland = require('highland')
const PuppetPool = require('./puppet-pool')
const buildScriptInjector = require('./file-injector')

const { pipeline, map, mergeWithLimit, errors } = highland
const { resolve, using } = bluebird
const injectReadabilityIntoPage = buildScriptInjector(require.resolve('readability'))

const fetchReadableArticle = (url) =>
  (browser) =>
    resolve(browser.newPage())
      .tap((page) => page.goto(url))
      .tap(injectReadabilityIntoPage)
      .call('evaluate', parseReadableArticle)

function create ({ poolSize, verbose }) {
  const pool = PuppetPool.create({ poolSize })
  const borrowBrowser = () => PuppetPool.borrow(pool, { verbose })
  const destroyPool = () => PuppetPool.destroy(pool, { verbose })

  const articlePipeline = pipeline(
    map((url) => using(borrowBrowser(), fetchReadableArticle(url))),
    map(highland),
    mergeWithLimit(poolSize),
    errors((err, push) => console.error(err))
  )

  articlePipeline.observe().done(destroyPool)

  return articlePipeline
}

function parseReadableArticle () {
  const { Readability } = window
  const { href, origin } = document.location
  const article = new Readability(document).parse()

  return { ...article, href, origin }
}

module.exports = { create }

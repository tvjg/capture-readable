const bluebird = require('bluebird')
const genericPool = require('generic-pool')
const puppeteer = require('puppeteer')

const PuppetPool = {
  create: (opts = {}) => {
    const puppetFactory = {
      create: () => puppeteer.launch(),
      destroy: browser => browser.close()
    }

    return genericPool.createPool(puppetFactory, {
      max: opts.poolSize || 1,
      Promise: bluebird.Promise,
      idleTimeoutMillis: 5000
    })
  },
  borrow: (pool, opts = {}) => {
    const log = () => {
      if (!opts.verbose) return
      logStats(pool)
    }
    const acquire = () => pool.acquire().tap(log)
    const release = (browser) => pool.release(browser).tap(log)
    log()
    return acquire().disposer(release)
  },
  destroy: (pool, opts = {}) => {
    const log = () => {
      if (!opts.verbose) return
      logStats(pool)
    }
    const drain = () => pool.drain().tap(log)
    const clear = () => pool.clear().tap(log)
    return drain().then(clear)
  }
}

function logStats ({ pending, borrowed, size, spareResourceCapacity }) {
  console.log(`Browsers: ${pending} pending requests, ${borrowed}/${size} in use, can create ${spareResourceCapacity} as needed.`)
}

module.exports = PuppetPool

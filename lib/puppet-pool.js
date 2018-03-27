const bluebird = require('bluebird')
const genericPool = require('generic-pool')
const puppeteer = require('puppeteer')

const PuppetPool = {
  create: (opts) => {
    let puppetFactory = {
      create: () => puppeteer.launch(),
      destroy: browser => browser.close()
    }

    return genericPool.createPool(puppetFactory, {
      max: opts.poolSize || 1,
      Promise: bluebird.Promise,
      idleTimeoutMillis: 5000
    })
  },
  borrow: (pool) => {
    let releaseBrowser = (browser) => pool.release(browser)
    return pool.acquire().disposer(releaseBrowser)
  },
  destroy: (pool) => {
    return pool.drain().then(() => pool.clear())
  }
}

module.exports = PuppetPool

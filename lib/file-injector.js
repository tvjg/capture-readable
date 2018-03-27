const { readFileSync } = require('fs')

// Would rather use addScriptTag/waitForFunction, but it runs into problems
// with CSP
function buildScriptInjector (path) {
  let file = readFileSync(path)

  file += `//# sourceURL=${path.replace(/\n/g, '')}`

  return (page) => page.evaluate(file)
}

module.exports = buildScriptInjector

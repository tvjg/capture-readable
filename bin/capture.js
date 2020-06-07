#!/usr/bin/env node
const parseArgs = require('minimist')
const highland = require('highland')
const CaptureReadableStream = require('../')

const DEFAULTS = {
  'pool-size': 2,
  output: './'
}

const ALIASES = {
  output: 'o',
  verbose: 'v',
  help: 'h'
}

const argv = parseArgs(process.argv.slice(2), {
  default: DEFAULTS,
  alias: ALIASES,
  boolean: ['verbose', 'help']
})

const usage = () =>
  `Usage: capture-readable [<option>...] <URI>...

Options:
  --pool-size    maximum number of headless Chromium instances to allocate  [default: ${DEFAULTS['pool-size']}]
  --output, -o   destination folder for captured HTML                       [default: ${DEFAULTS.output}]
  --verbose, -v  enable debugging output
  --help, -h     display this message
`

const MISSING_ARGUMENTS = 'One or more URIs must be provided. See `capture-readable --help` for usage notes.'

const fail = (msg) => {
  console.error(msg)
  process.exit(1)
}

if (argv.help) {
  console.log(usage())
  process.exit()
}

const uris = process.stdin.isTTY
  ? (argv._.length > 0) ? argv._ : fail(MISSING_ARGUMENTS)
  : process.stdin

const opts = {
  poolSize: argv['pool-size'],
  outputDirectory: argv.output,
  verbose: argv.verbose
}

highland(uris)
  .through(CaptureReadableStream.create(opts))
  .pipe(process.stdout)

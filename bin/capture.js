#!/usr/bin/env node
const highland = require('highland')
const captureReadable = require('../')

highland(process.stdin).through(captureReadable).pipe(process.stdout)

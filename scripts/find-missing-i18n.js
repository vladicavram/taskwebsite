#!/usr/bin/env node
/**
 * Scan source files for t('...') or getTranslation(locale, '...') usages
 * and report keys missing from messages/en.json (treat en.json as canonical).
 * This is a heuristic regex-based finder; it may miss dynamic keys.
 */
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const messagesPath = path.join(root, 'messages', 'en.json')
const ignoreDirs = new Set(['node_modules', '.next', '.git', 'Build', 'public'])
const exts = new Set(['.ts', '.tsx', '.js', '.jsx'])

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function collectFiles(dir, out) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    if (ignoreDirs.has(e.name)) continue
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      collectFiles(full, out)
    } else if (exts.has(path.extname(e.name))) {
      out.push(full)
    }
  }
}

function collectKeysFromSource(file) {
  const text = fs.readFileSync(file, 'utf8')
  const keys = new Set()
  const regexes = [
    /\bt\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    /getTranslation\([^,]+,\s*['"`]([^'"`]+)['"`]\s*\)/g
  ]
  for (const re of regexes) {
    let m
    while ((m = re.exec(text)) !== null) {
      keys.add(m[1])
    }
  }
  return keys
}

function main() {
  const messages = readJson(messagesPath)
  const messageKeys = new Set(Object.keys(messages))

  const files = []
  collectFiles(root, files)

  const usedKeys = new Set()
  for (const f of files) {
    for (const k of collectKeysFromSource(f)) {
      usedKeys.add(k)
    }
  }

  const missing = []
  for (const k of usedKeys) {
    if (!messageKeys.has(k)) missing.push(k)
  }

  missing.sort()
  if (missing.length === 0) {
    console.log('No missing keys found (based on messages/en.json).')
  } else {
    console.log('Missing keys:', missing.length)
    for (const k of missing) console.log(' -', k)
  }
}

main()

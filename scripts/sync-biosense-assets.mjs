/**
 * По docs/SDK.md (CopyPlugin): runtime-файлы из @biosensesignal/web-sdk/dist
 * должны быть доступны с корня приложения (a.wasm.gz, a.worker.js, models/, чанки .js).
 * main.js подключаем из бандла — в public не копируем.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const srcDir = path.join(root, 'vendor/biosensesignal/package/dist')
const publicDir = path.join(root, 'public')

const SKIP_ROOT = new Set([
  'main.js',
  'postinstall.js',
  'main.js.LICENSE.txt',
])

function sync() {
  if (!fs.existsSync(srcDir)) {
    console.warn('sync-biosense-assets: пропуск — нет каталога', srcDir)
    return
  }
  for (const name of fs.readdirSync(srcDir)) {
    if (SKIP_ROOT.has(name)) continue
    const from = path.join(srcDir, name)
    const to = path.join(publicDir, name)
    const stat = fs.statSync(from)
    if (stat.isDirectory()) {
      if (name === 'models') {
        fs.cpSync(from, to, { recursive: true })
      }
      continue
    }
    if (name.endsWith('.d.ts')) continue
    fs.copyFileSync(from, to)
  }
  console.log('sync-biosense-assets: SDK runtime скопированы в public/')
}

sync()

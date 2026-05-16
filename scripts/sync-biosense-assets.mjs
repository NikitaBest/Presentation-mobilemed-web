/**
 * По docs/SDK.md (CopyPlugin): runtime-файлы из @biosensesignal/web-sdk/dist
 * должны быть доступны с корня приложения (a.wasm.gz, a.worker.js, models/, чанки .js).
 * main.js подключаем из бандла — в public не копируем.
 *
 * На CI (Vercel и т.д.) в git только .tgz — dist распаковываем перед sync.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const vendorDir = path.join(root, 'vendor/biosensesignal')
const tgzPath = path.join(vendorDir, 'biosensesignal-web-sdk-v5.11.1-1.tgz')
const packageDir = path.join(vendorDir, 'package')
const srcDir = path.join(packageDir, 'dist')
const publicDir = path.join(root, 'public')

const SKIP_ROOT = new Set([
  'main.js',
  'postinstall.js',
  'main.js.LICENSE.txt',
])

function ensureVendorDist() {
  if (fs.existsSync(srcDir)) return

  if (!fs.existsSync(tgzPath)) {
    throw new Error(
      `sync-biosense-assets: нет ${srcDir} и архива ${tgzPath}. ` +
        'Добавьте biosensesignal-web-sdk-*.tgz в vendor/biosensesignal/ или распакуйте SDK локально.',
    )
  }

  console.log('sync-biosense-assets: распаковка SDK из', path.basename(tgzPath))
  fs.mkdirSync(vendorDir, { recursive: true })
  execFileSync('tar', ['-xzf', tgzPath, '-C', vendorDir], { stdio: 'inherit' })

  if (!fs.existsSync(srcDir)) {
    throw new Error(`sync-biosense-assets: после распаковки не найден ${srcDir}`)
  }
}

function sync() {
  ensureVendorDist()
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

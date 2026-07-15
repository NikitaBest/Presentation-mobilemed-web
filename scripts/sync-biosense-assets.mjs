/**
 * Runtime-файлы из @biosensesignal/web-sdk/dist → public/ (a.wasm.gz, a.worker.js, models/, чанки).
 * main.js в public не копируем — грузим через <script src="/main.js"> из node_modules/dist при dev
 * или из public после sync (см. loadBiosenseSdk.js).
 *
 * Источник (по приоритету):
 * 1. node_modules/@biosensesignal/web-sdk/dist (npm / Artifactory / file:vendor tgz)
 * 2. vendor/biosensesignal/package/dist (распаковка из .tgz, если node_modules нет)
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SDK_VERSION = '5.13.1'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const vendorDir = path.join(root, 'vendor/biosensesignal')
const tgzPath = path.join(vendorDir, `biosensesignal-web-sdk-v${SDK_VERSION}.tgz`)
const vendorPackageDir = path.join(vendorDir, 'package')
const vendorPackageJsonPath = path.join(vendorPackageDir, 'package.json')
const vendorDistDir = path.join(vendorPackageDir, 'dist')
const nodeModulesDistDir = path.join(root, 'node_modules/@biosensesignal/web-sdk/dist')
const publicDir = path.join(root, 'public')

const SKIP_ROOT = new Set(['postinstall.js', 'main.js.LICENSE.txt'])

function readInstalledVendorVersion() {
  if (!fs.existsSync(vendorPackageJsonPath)) return null
  try {
    const pkg = JSON.parse(fs.readFileSync(vendorPackageJsonPath, 'utf8'))
    return typeof pkg.version === 'string' ? pkg.version : null
  } catch {
    return null
  }
}

function extractVendorDist() {
  if (!fs.existsSync(tgzPath)) {
    throw new Error(
      `sync-biosense-assets: архив не найден: ${tgzPath}. ` +
        `Добавьте biosensesignal-web-sdk-v${SDK_VERSION}.tgz в vendor/biosensesignal/ ` +
        'или установите пакет через npm (Artifactory / file: в package.json).',
    )
  }

  console.log('sync-biosense-assets: распаковка SDK из', path.basename(tgzPath))
  if (fs.existsSync(vendorPackageDir)) {
    fs.rmSync(vendorPackageDir, { recursive: true, force: true })
  }
  fs.mkdirSync(vendorDir, { recursive: true })
  execFileSync('tar', ['-xzf', tgzPath, '-C', vendorDir], { stdio: 'inherit' })

  if (!fs.existsSync(vendorDistDir)) {
    throw new Error(`sync-biosense-assets: после распаковки не найден ${vendorDistDir}`)
  }
}

function ensureVendorDist() {
  const installedVersion = readInstalledVendorVersion()
  if (installedVersion === SDK_VERSION && fs.existsSync(vendorDistDir)) return
  extractVendorDist()
}

function resolveSrcDir() {
  if (fs.existsSync(nodeModulesDistDir)) {
    console.log('sync-biosense-assets: источник — node_modules/@biosensesignal/web-sdk/dist')
    return nodeModulesDistDir
  }

  ensureVendorDist()
  if (fs.existsSync(vendorDistDir)) {
    console.log('sync-biosense-assets: источник — vendor/biosensesignal/package/dist')
    return vendorDistDir
  }

  throw new Error(
    'sync-biosense-assets: не найден dist SDK. Выполните npm install или положите .tgz в vendor/biosensesignal/.',
  )
}

function sync() {
  const srcDir = resolveSrcDir()
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

/**
 * Создаёт .npmrc для JFrog Artifactory, если задан JFROG_API_KEY.
 * Без ключа — npm использует file:vendor/…tgz из package.json (legacy fallback).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const npmrcPath = path.join(root, '.npmrc')
const token = String(process.env.JFROG_API_KEY ?? '').trim()

if (!token) {
  if (fs.existsSync(npmrcPath)) {
    console.log('setup-npmrc: JFROG_API_KEY не задан, существующий .npmrc не трогаем')
  }
  process.exit(0)
}

const content = `@biosensesignal:registry=https://biosensesignal.jfrog.io/artifactory/api/npm/biosensesignal-web-sdk/
//biosensesignal.jfrog.io/artifactory/api/npm/biosensesignal-web-sdk/:_authToken=${token}
//biosensesignal.jfrog.io/artifactory/api/npm/biosensesignal-web-sdk/:always-auth=true
`

fs.writeFileSync(npmrcPath, content, 'utf8')
console.log('setup-npmrc: .npmrc создан для @biosensesignal (Artifactory)')

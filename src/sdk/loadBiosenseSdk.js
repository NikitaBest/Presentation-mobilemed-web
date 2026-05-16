/**
 * BioSense Web SDK (UMD): в production нельзя импортировать dist/main.js через Vite/Rollup —
 * бандлер подставляет module.exports и globalThis.default не появляется.
 * Runtime грузим отдельным <script src="/main.js">, чанки — из public/ (sync-biosense-assets).
 */

let scriptPromise = null

function assertManager(manager) {
  if (manager && typeof manager.initialize === 'function') return manager
  throw new Error(
    'BioSense Web SDK: после загрузки /main.js ожидался globalThis.default с методом initialize',
  )
}

export function loadBiosenseSdkScript() {
  const existing = globalThis.default
  if (existing && typeof existing.initialize === 'function') {
    return Promise.resolve(existing)
  }
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = '/main.js'
    script.async = false
    script.onload = () => {
      try {
        resolve(assertManager(globalThis.default))
      } catch (e) {
        scriptPromise = null
        reject(e)
      }
    }
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Не удалось загрузить /main.js (BioSense SDK)'))
    }
    document.head.appendChild(script)
  })

  return scriptPromise
}

export async function getHealthMonitorManager() {
  return loadBiosenseSdkScript()
}

/**
 * Vite загружает dist/main.js как ESM: у Webpack-UMD нет настоящего export default.
 * В ветке «без module.exports» бандл вешает API на globalThis, в т.ч. default = HealthMonitorManager.
 */
import '../../vendor/biosensesignal/package/dist/main.js'

const healthMonitorManager = globalThis.default

if (!healthMonitorManager || typeof healthMonitorManager.initialize !== 'function') {
  throw new Error(
    'BioSense Web SDK: после загрузки dist/main.js ожидался globalThis.default с методом initialize',
  )
}

export default healthMonitorManager

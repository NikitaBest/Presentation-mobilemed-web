/**
 * Алиас @biosensesignal/web-sdk для Vite.
 * Синхронный default недоступен до загрузки /main.js — используйте loadBiosenseSdk.js.
 */
export { getHealthMonitorManager as default, loadBiosenseSdkScript } from './loadBiosenseSdk.js'

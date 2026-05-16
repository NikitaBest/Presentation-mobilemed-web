/**
 * Диагностика сканирования: префикс «[Scan SDK]» — это логи приложения, не внутренний вывод Biosense.
 * В dev включено; в prod — VITE_SCAN_SDK_DEBUG=1 в .env
 */
const enabled =
  Boolean(import.meta.env?.DEV) || String(import.meta.env?.VITE_SCAN_SDK_DEBUG ?? '').trim() === '1'

export function scanSdkDebug(label, data) {
  if (!enabled || typeof console === 'undefined') return
  if (data !== undefined) console.log('[Scan SDK]', label, data)
  else console.log('[Scan SDK]', label)
}

export function isScanSdkDebugEnabled() {
  return enabled
}

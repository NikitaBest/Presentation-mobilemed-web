/**
 * Базовый URL backend. Задаётся через VITE_API_BASE_URL в .env (без хардкода в UI).
 * На этапе каркаса значение может быть пустым.
 */
export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL ?? ''
}

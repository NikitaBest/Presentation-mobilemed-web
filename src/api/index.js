/**
 * Слой HTTP-запросов к backend (см. docs/API.md).
 */
export { apiFetch } from './client.js'
export { postAuthLogin, ensureAuthSession, resolveLoginUserId } from './auth.js'
export {
  getUserMe,
  putUserUpdate,
  mapFormToUpdateUserRequest,
  mapUserEntityToFormPatch,
} from './user.js'
export {
  getStoredToken,
  getStoredUserId,
  setSessionFromLogin,
  clearSession,
} from './session.js'
export { postSaveRppgScan } from './scan.js'

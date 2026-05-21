/**
 * Слой HTTP-запросов к backend (см. docs/API.md).
 */
export { apiFetch } from './client.js'
export {
  postAuthLogin,
  postAuthRegister,
  postAuthRefreshToken,
  ensureAuthSession,
  reauthenticateWithCurrentLocale,
  resolveLoginUserId,
  clearAuthSession,
  AuthRequiredError,
} from './auth.js'
export {
  getUserMe,
  putUserUpdate,
  mapFormToUpdateUserRequest,
  mapUserEntityToFormPatch,
} from './user.js'
export {
  getStoredToken,
  getStoredUserId,
  getStoredEmail,
  setSessionFromLogin,
  clearSession,
} from './session.js'
export { postSaveRppgScan } from './scan.js'

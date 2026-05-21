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
  mapFormToSaveRppgRequest,
  mapUserEntityToFormPatch,
} from './user.js'
export {
  getScansHistory,
  getAllScansHistory,
  mergeScanHistoryRows,
  normalizeScanHistoryRow,
  getScanDisplayName,
  getScanRowId,
  getScanRowCreatedAt,
  getScanHistoryRowKey,
  SCAN_HISTORY_DEFAULT_PAGE_SIZE,
  SCAN_HISTORY_HOME_PREVIEW_SIZE,
} from './scanHistory.js'
export {
  getStoredToken,
  getStoredUserId,
  getStoredEmail,
  setSessionFromLogin,
  clearSession,
} from './session.js'
export { postSaveRppgScan } from './scan.js'

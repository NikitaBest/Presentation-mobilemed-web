/** @typedef {'privacy' | 'personalData'} LegalDocumentId */

/** @type {LegalDocumentId[]} */
export const LEGAL_DOCUMENT_ORDER = ['privacy', 'personalData']

/**
 * @param {LegalDocumentId} id
 * @param {(key: string) => string} t
 * @returns {{ id: LegalDocumentId, title: string, body: string }}
 */
export function getLegalDocument(id, t) {
  return {
    id,
    title: t(`settings.documents.${id}.title`),
    body: t(`settings.documents.${id}.body`),
  }
}

/**
 * @param {(key: string) => string} t
 * @returns {Array<{ id: LegalDocumentId, title: string, body: string }>}
 */
export function buildLegalDocuments(t) {
  return LEGAL_DOCUMENT_ORDER.map((id) => getLegalDocument(id, t))
}

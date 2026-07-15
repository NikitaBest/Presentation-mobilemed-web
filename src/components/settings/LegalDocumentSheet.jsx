import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../i18n/useI18n.js'
import './LegalDocumentSheet.css'

/**
 * @param {{
 *   document: { id: string, title: string, body: string } | null,
 *   onClose: () => void,
 * }} props
 */
export function LegalDocumentSheet({ document: doc, onClose }) {
  const { t } = useI18n()
  const titleId = useId()
  const open = doc != null

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('mm-legal-sheet-open')
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.body.classList.remove('mm-legal-sheet-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || !doc) return null

  const paragraphs = doc.body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)

  return createPortal(
    <div className="legal-doc-sheet" role="presentation">
      <button
        type="button"
        className="legal-doc-sheet__backdrop"
        aria-label={t('common.close')}
        onClick={onClose}
      />
      <div className="legal-doc-sheet__column">
        <div
          className="legal-doc-sheet__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="legal-doc-sheet__scroll">
            <div className="legal-doc-sheet__handle" aria-hidden />
            <h2 id={titleId} className="legal-doc-sheet__title">
              {doc.title}
            </h2>
            <div className="legal-doc-sheet__body">
              {paragraphs.map((paragraph, index) => (
                <p key={`${doc.id}-p-${index}`}>{paragraph}</p>
              ))}
            </div>
          </div>
          <footer className="legal-doc-sheet__footer">
            <button type="button" className="legal-doc-sheet__btn" onClick={onClose}>
              {t('settings.documents.close')}
            </button>
          </footer>
        </div>
      </div>
    </div>,
    document.body,
  )
}

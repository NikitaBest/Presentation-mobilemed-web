import { useMemo, useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { LegalDocumentSheet } from '../components/settings/LegalDocumentSheet.jsx'
import { buildLegalDocuments } from '../utils/legalDocuments.js'
import { useI18n } from '../i18n/useI18n.js'
import './DocumentsPage.css'

/**
 * @param {{ onBack: () => void }} props
 */
export function DocumentsPage({ onBack }) {
  const { t } = useI18n()
  const [openDocument, setOpenDocument] = useState(null)
  const legalDocuments = useMemo(() => buildLegalDocuments(t), [t])

  return (
    <AppLayout>
      <div className="documents-page page-shell">
        <header className="documents-page__header">
          <span className="documents-page__brand">{t('results.brand')}</span>
          <h1 className="documents-page__title">{t('settings.documents.pageTitle')}</h1>
          <p className="documents-page__lead">{t('settings.documents.pageLead')}</p>
        </header>

        <div className="documents-page__scroll page-shell__scroll">
          <ul className="documents-page__list" aria-label={t('settings.documents.sectionTitle')}>
            {legalDocuments.map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  className="documents-page__item"
                  onClick={() => setOpenDocument(doc)}
                >
                  <span className="documents-page__item-label">{doc.title}</span>
                  <span className="documents-page__item-chevron" aria-hidden>
                    ›
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <footer className="page-dock documents-page__dock" aria-label={t('common.back')}>
          <button type="button" className="btn-secondary documents-page__back" onClick={onBack}>
            {t('common.back')}
          </button>
        </footer>

        <LegalDocumentSheet document={openDocument} onClose={() => setOpenDocument(null)} />
      </div>
    </AppLayout>
  )
}

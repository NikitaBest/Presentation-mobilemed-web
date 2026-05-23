import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { splitBannerParagraphs } from '../../utils/homeBanners.js'
import { useI18n } from '../../i18n/useI18n.js'
import './HomeBannerDetailSheet.css'

/**
 * @param {{
 *   banner: {
 *     id: string,
 *     accent: string,
 *     tag: string,
 *     title: string,
 *     body?: string,
 *     bodyDetail?: string,
 *   } | null,
 *   onClose: () => void,
 * }} props
 */
export function HomeBannerDetailSheet({ banner, onClose }) {
  const { t } = useI18n()
  const titleId = useId()
  const open = banner != null

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('mm-banner-sheet-open')
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.body.classList.remove('mm-banner-sheet-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || !banner) return null

  const paragraphs = splitBannerParagraphs(banner.bodyDetail ?? banner.body ?? '')
  const accent =
    banner.accent === 'privacy' || banner.accent === 'about' ? banner.accent : 'neutral'

  return createPortal(
    <div className="home-banner-sheet" role="presentation">
      <button
        type="button"
        className="home-banner-sheet__backdrop"
        aria-label={t('common.close')}
        onClick={onClose}
      />
      <div className="home-banner-sheet__column">
        <div
          className={`home-banner-sheet__panel home-banner-sheet__panel--accent-${accent}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
        <div className="home-banner-sheet__scroll">
          <div className="home-banner-sheet__handle" aria-hidden />

          <span className={`home-banner-sheet__tag home-banner-sheet__tag--accent-${accent}`}>
            {banner.tag}
          </span>

          <h2 id={titleId} className="home-banner-sheet__title">
            {banner.title}
          </h2>

          {banner.body ? <p className="home-banner-sheet__lead">{banner.body}</p> : null}

          {paragraphs.length > 0 ? (
            <div className="home-banner-sheet__body">
              {paragraphs.map((paragraph, index) => (
                <p key={`${banner.id}-p-${index}`}>{paragraph}</p>
              ))}
            </div>
          ) : null}
        </div>

        <footer className="home-banner-sheet__footer">
          <button type="button" className="home-banner-sheet__btn" onClick={onClose}>
            {t('home.banner.sheetOk')}
          </button>
        </footer>
        </div>
      </div>
    </div>,
    document.body,
  )
}

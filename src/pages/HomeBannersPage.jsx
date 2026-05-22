import { useMemo } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { buildHomeBanners, splitBannerParagraphs } from '../utils/homeBanners.js'
import { useI18n } from '../i18n/useI18n.js'
import './HomeBannersPage.css'

/**
 * @param {{
 *   onBack: () => void,
 *   latestRow?: object | null,
 * }} props
 */
export function HomeBannersPage({ onBack, latestRow = null }) {
  const { locale, t } = useI18n()
  const banners = useMemo(
    () => buildHomeBanners({ t, locale, latestRow }),
    [t, locale, latestRow],
  )

  return (
    <AppLayout>
      <div className="home-banners-page page-shell">
        <header className="home-banners-page__header">
          <span className="home-banners-page__brand">{t('home.brand')}</span>
          <h1 className="home-banners-page__title">{t('home.banner.pageTitle')}</h1>
          <p className="home-banners-page__lead">{t('home.banner.pageLead')}</p>
        </header>

        <ul className="home-banners-page__list page-shell__scroll">
          {banners.map((banner) => {
            const paragraphs = splitBannerParagraphs(banner.bodyDetail ?? banner.body)

            return (
              <li key={banner.id}>
                <article className="home-banners-page__card">
                  <span
                    className={`home-banners-page__tag home-banners-page__tag--accent-${banner.accent}`}
                  >
                    {banner.tag}
                  </span>

                  {banner.kind === 'latestMetric' && banner.hasMetricData ? (
                    <div className="home-banners-page__summary">
                      <div className="home-banners-page__overall">
                        <span className="home-banners-page__status">
                          {banner.overallStatus ?? banner.title}
                        </span>
                        {banner.healthScore && banner.healthScore !== '—' ? (
                          <span className="home-banners-page__score">
                            {banner.healthScore}
                            <span className="home-banners-page__score-of">/ 100</span>
                          </span>
                        ) : null}
                      </div>
                      <p className="home-banners-page__metric-line">{banner.body}</p>
                      {banner.whenLabel ? (
                        <p className="home-banners-page__metric-when">
                          <time>{banner.whenLabel}</time>
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <h2 className="home-banners-page__card-title">{banner.title}</h2>
                  )}

                  <div className="home-banners-page__card-body">
                    {paragraphs.map((paragraph, paragraphIndex) => (
                      <p key={`${banner.id}-p-${paragraphIndex}`}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>

        <footer className="page-dock home-banners-page__dock">
          <button type="button" className="btn-primary" onClick={onBack}>
            {t('home.banner.back')}
          </button>
        </footer>
      </div>
    </AppLayout>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import bannerAboutBg from '../../assets/banner.png'
import { useI18n } from '../../i18n/useI18n.js'
import './HomeBannerCarousel.css'

const ROTATE_MS = 5200
const SWIPE_MIN_PX = 48

/**
 * @param {{
 *   banners: Array<{
 *     id: string,
 *     kind?: string,
 *     accent: string,
 *     tag: string,
 *     title: string,
 *     body: string,
 *     overallStatus?: string,
 *     healthScore?: string,
 *     metricName?: string,
 *     whenLabel?: string,
 *     hasMetricData?: boolean,
 *   }>,
 *   onOpenAll: () => void,
 * }} props
 */
export function HomeBannerCarousel({ banners, onOpenAll }) {
  const { t } = useI18n()
  const [index, setIndex] = useState(0)
  const count = banners.length
  const touchRef = useRef({ startX: 0, startY: 0, swiped: false })

  const goTo = useCallback(
    (next) => {
      if (count < 2) return
      setIndex((next + count) % count)
    },
    [count],
  )

  useEffect(() => {
    if (count < 2) return undefined
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count)
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [count])

  useEffect(() => {
    if (index >= count && count > 0) {
      setIndex(0)
    }
  }, [count, index])

  const handleTouchStart = useCallback((event) => {
    const touch = event.changedTouches[0]
    if (!touch) return
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      swiped: false,
    }
  }, [])

  const handleTouchEnd = useCallback(
    (event) => {
      if (count < 2) return
      const touch = event.changedTouches[0]
      if (!touch) return

      const dx = touch.clientX - touchRef.current.startX
      const dy = touch.clientY - touchRef.current.startY

      if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy)) return

      touchRef.current.swiped = true
      if (dx < 0) {
        goTo(index + 1)
      } else {
        goTo(index - 1)
      }
    },
    [count, goTo, index],
  )

  const handleOpenClick = useCallback(() => {
    if (touchRef.current.swiped) {
      touchRef.current.swiped = false
      return
    }
    onOpenAll()
  }, [onOpenAll])

  if (count === 0) return null

  const active = banners[index] ?? banners[0]
  const isAboutBanner = active.id === 'about'
  const isMetric = active.kind === 'latestMetric'
  const bandClass =
    active.accent === 'green' ||
    active.accent === 'yellow' ||
    active.accent === 'red'
      ? active.accent
      : 'unknown'

  return (
    <section className="home-banners" aria-label={t('home.banner.sectionAria')}>
      <div
        className={`home-banners__card home-banners__card--accent-${active.accent}${
          isAboutBanner ? ' home-banners__card--about-bg' : ''
        }`}
        style={
          isAboutBanner
            ? { '--home-banner-about-bg': `url(${bannerAboutBg})` }
            : undefined
        }
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          className="home-banners__open"
          onClick={handleOpenClick}
          aria-label={t('home.banner.openAllAria')}
        >
          <div className="home-banners__content" aria-live="polite">
            <article
              key={active.id}
              className={`home-banners__panel${
                isAboutBanner ? ' home-banners__panel--about-only' : ''
              }`}
            >
              <div className="home-banners__head">
                <span
                  className={`home-banners__tag home-banners__tag--accent-${active.accent}`}
                >
                  {active.tag}
                </span>
                <span className="home-banners__chevron" aria-hidden>
                  ›
                </span>
              </div>

              {isMetric ? (
                active.hasMetricData ? (
                  <div className="home-banners__metric-block">
                    <div className="home-banners__overall">
                      <span
                        className={`home-banners__pill home-banners__pill--${bandClass}`}
                      >
                        {active.overallStatus ?? active.title}
                      </span>
                      {active.healthScore && active.healthScore !== '—' ? (
                        <span className="home-banners__score">
                          <span className="home-banners__score-value">
                            {active.healthScore}
                          </span>
                          <span className="home-banners__score-of">/ 100</span>
                        </span>
                      ) : null}
                    </div>
                    <p className="home-banners__metric-name">{active.body}</p>
                    {active.whenLabel ? (
                      <p className="home-banners__when">
                        <time>{active.whenLabel}</time>
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="home-banners__body home-banners__body--empty">
                    {active.body}
                  </p>
                )
              ) : isAboutBanner ? null : (
                <div className="home-banners__text-block">
                  <h3 className="home-banners__title">{active.title}</h3>
                  <p className="home-banners__body">{active.body}</p>
                </div>
              )}
            </article>
          </div>
        </button>

        {count > 1 ? (
          <div className="home-banners__dots" role="tablist" aria-label={t('home.banner.dotsAria')}>
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                type="button"
                role="tab"
                className={`home-banners__dot${i === index ? ' home-banners__dot--active' : ''}`}
                aria-selected={i === index}
                aria-label={t('home.banner.dotAria', {
                  current: String(i + 1),
                  total: String(count),
                })}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

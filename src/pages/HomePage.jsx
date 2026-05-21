import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { getScansHistory } from '../api/scanHistory.js'
import { useI18n } from '../i18n/useI18n.js'
import {
  formatUserProfileLines,
  isUserProfileFilled,
} from '../utils/userProfileDisplay.js'
import './HomePage.css'

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M19.4 13a7.97 7.97 0 0 0 .1-2l2-1.2-2-3.4-2.3.9a8.1 8.1 0 0 0-1.7-1L15.5 2h-7L8.5 5.3a8.1 8.1 0 0 0-1.7 1L4.5 5.4l-2 3.4 2 1.2a7.97 7.97 0 0 0 0 2l-2 1.2 2 3.4 2.3-.9a8.1 8.1 0 0 0 1.7 1L8.5 22h7l.8-3.3a8.1 8.1 0 0 0 1.7-1l2.3.9 2-3.4-1.9-1.2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconScan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 4h8a2 2 0 0 1 2 2v2M8 20H6a2 2 0 0 1-2-2v-2M20 14v2a2 2 0 0 1-2 2h-2M4 10V8a2 2 0 0 1 2-2h2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <ellipse cx="12" cy="12" rx="4" ry="5.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function formatScanDate(iso, locale) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleString(locale === 'en' ? 'en-GB' : 'ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

/**
 * @param {{
 *   userForm: object,
 *   onStartScan: () => void,
 *   onOpenSettings: () => void,
 *   onOpenScan: (row: object) => void,
 *   onEditProfile: () => void,
 * }} props
 */
export function HomePage({
  userForm,
  onStartScan,
  onOpenSettings,
  onOpenScan,
  onEditProfile,
}) {
  const { locale, t } = useI18n()
  const profileLines = useMemo(
    () => formatUserProfileLines(userForm, t, locale),
    [userForm, t, locale],
  )
  const profileFilled = useMemo(() => isUserProfileFilled(userForm), [userForm])
  const [phase, setPhase] = useState('loading')
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setPhase('loading')
    setError('')
    try {
      const res = await getScansHistory({ pageNumber: 1, pageSize: 20 })
      const data = res?.value?.data
      setRows(Array.isArray(data) ? data : [])
      setPhase(Array.isArray(data) && data.length > 0 ? 'ready' : 'empty')
    } catch (e) {
      setPhase('error')
      setError(e instanceof Error ? e.message : t('home.historyError'))
      setRows([])
    }
  }, [t])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- загрузка истории на главной */
    void load()
  }, [load])

  return (
    <AppLayout>
      <div className="home-page page-shell">
        <header className="home-page__header">
          <div className="home-page__header-top">
            <h1 className="home-page__title">{t('home.title')}</h1>
            <button
              type="button"
              className="home-page__settings-btn"
              aria-label={t('home.openSettings')}
              onClick={onOpenSettings}
            >
              <IconSettings />
            </button>
          </div>
          <span className="home-page__brand">{t('home.brand')}</span>
          <p className="home-page__lead">{t('home.lead')}</p>
        </header>

        <div className="home-page__scroll page-shell__scroll">
          <section className="home-profile" aria-labelledby="home-profile-title">
            <div className="home-profile__head">
              <h2 id="home-profile-title" className="home-profile__title">
                {t('home.profileTitle')}
              </h2>
              <span className="home-profile__edit-hint">{t('home.profileEdit')}</span>
            </div>
            <button
              type="button"
              className="home-profile__card"
              aria-label={t('home.profileOpen')}
              onClick={onEditProfile}
            >
              {!profileFilled ? (
                <p className="home-profile__empty">{t('home.profileEmpty')}</p>
              ) : null}
              <dl className="home-profile__dl">
                {profileLines.map((line) => (
                  <div key={line.label} className="home-profile__row">
                    <dt className="home-profile__label">{line.label}</dt>
                    <dd className="home-profile__value">{line.value}</dd>
                  </div>
                ))}
              </dl>
            </button>
          </section>

          <section className="home-history" aria-labelledby="home-history-title">
            <h2 id="home-history-title" className="home-history__title">
              {t('home.historyTitle')}
            </h2>

            {phase === 'loading' ? (
              <p className="home-history__status">{t('home.historyLoading')}</p>
            ) : null}

            {phase === 'error' ? (
              <div className="home-history__error-wrap">
                <p className="home-history__error" role="alert">
                  {error}
                </p>
                <button type="button" className="btn-secondary home-history__retry" onClick={() => void load()}>
                  {t('home.historyRetry')}
                </button>
              </div>
            ) : null}

            {phase === 'empty' ? (
              <p className="home-history__empty">{t('home.historyEmpty')}</p>
            ) : null}

            {phase === 'ready' ? (
              <ul className="home-history__list">
                {rows.map((row) => {
                  const id = row?.scan?.id ?? row?.rppgScanId
                  const dateLabel = formatScanDate(row?.scan?.createdAt ?? row?.createdAt, locale)
                  const score = row?.healthScore
                  const scoreText =
                    score != null && score !== '' && Number.isFinite(Number(score))
                      ? String(Math.round(Number(score)))
                      : '—'
                  return (
                    <li key={id ?? dateLabel}>
                      <button
                        type="button"
                        className="home-history__item"
                        aria-label={t('home.historyOpen', { date: dateLabel })}
                        onClick={() => onOpenScan(row)}
                      >
                        <span className="home-history__item-date">{dateLabel}</span>
                        <span className="home-history__item-score">
                          <span className="home-history__item-score-label">{t('home.historyScore')}</span>
                          <span className="home-history__item-score-value">{scoreText}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </section>

          <button type="button" className="home-scan-card" onClick={onStartScan}>
            <span className="home-scan-card__icon" aria-hidden>
              <IconScan />
            </span>
            <span className="home-scan-card__body">
              <span className="home-scan-card__title">{t('home.scanTitle')}</span>
              <span className="home-scan-card__lead">{t('home.scanLead')}</span>
            </span>
            <span className="home-scan-card__chevron" aria-hidden>
              ›
            </span>
          </button>
        </div>

        <footer className="page-dock home-page__dock">
          <button type="button" className="btn-primary" onClick={onStartScan}>
            {t('home.scanAction')}
          </button>
        </footer>
      </div>
    </AppLayout>
  )
}

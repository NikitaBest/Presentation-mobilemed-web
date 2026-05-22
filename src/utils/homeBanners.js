import { getScanRowCreatedAt } from '../api/scanHistory.js'
import { healthScoreBand } from '../components/healthScoreBand.js'
import {
  filterDisplayableTranscripts,
  sortTranscriptsByColor,
} from './metricTranscript.js'
import { formatScanWhen } from './scanDate.js'

const BANNER_ORDER = ['latestMetric', 'privacy', 'about']

/**
 * @param {string | undefined} text
 * @returns {string[]}
 */
export function splitBannerParagraphs(text) {
  if (!text || !String(text).trim()) return []
  return String(text)
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/**
 * @param {object | null | undefined} row
 * @returns {object | null}
 */
function pickHighlightTranscript(row) {
  const list = sortTranscriptsByColor(filterDisplayableTranscripts(row?.transcripts))
  return list[0] ?? null
}

/**
 * @param {{
 *   t: (key: string, vars?: Record<string, string>) => string,
 *   locale: 'ru' | 'en',
 *   latestRow?: object | null,
 * }} opts
 * @returns {Array<{
 *   id: string,
 *   kind: 'latestMetric' | 'static',
 *   accent: string,
 *   tag: string,
 *   title: string,
 *   body: string,
 *   bodyDetail?: string,
 *   overallStatus?: string,
 *   healthScore?: string,
 *   metricName?: string,
 *   whenLabel?: string,
 *   hasMetricData?: boolean,
 * }>}
 */
export function buildHomeBanners({ t, locale, latestRow }) {
  const when = latestRow
    ? formatScanWhen(getScanRowCreatedAt(latestRow), locale)
    : null
  const whenLabel =
    when && (when.time ? `${when.date} · ${when.time}` : when.date)

  /** @type {Record<string, ReturnType<typeof buildHomeBanners>[number]>} */
  const byId = {
    latestMetric: latestRow
      ? (() => {
          const score = latestRow.healthScore
          const band = healthScoreBand(score)
          const accent =
            band === 'green' || band === 'yellow' || band === 'red' ? band : 'neutral'
          const n = score != null && score !== '' ? Number(score) : NaN
          const scoreText = Number.isFinite(n) ? String(Math.round(n)) : '—'
          const overallStatus = t(`healthScore.band.${band}`)
          const metric = pickHighlightTranscript(latestRow)
          const metricName = metric?.name ? String(metric.name).trim() : ''

          return {
            id: 'latestMetric',
            kind: 'latestMetric',
            accent,
            tag: t('home.banner.tag.latestMetric'),
            title: overallStatus,
            body: metricName
              ? t('home.banner.latestMetric.metricLine', { name: metricName })
              : t('home.banner.latestMetric.noMetricLine'),
            bodyDetail: t('home.banner.latestMetric.bodyDetail', {
              status: overallStatus,
              score: scoreText,
              metric: metricName
                ? t('home.banner.latestMetric.metricLine', { name: metricName })
                : t('home.banner.latestMetric.noMetricLine'),
              date: whenLabel ?? '',
            }),
            overallStatus,
            healthScore: scoreText,
            metricName,
            whenLabel: whenLabel ?? '',
            hasMetricData: true,
          }
        })()
      : {
          id: 'latestMetric',
          kind: 'latestMetric',
          accent: 'neutral',
          tag: t('home.banner.tag.latestMetric'),
          title: t('home.banner.latestMetric.emptyTitle'),
          body: t('home.banner.latestMetric.emptyBody'),
          bodyDetail: t('home.banner.latestMetric.emptyBodyDetail'),
          hasMetricData: false,
        },
    privacy: {
      id: 'privacy',
      kind: 'static',
      accent: 'privacy',
      tag: t('home.banner.tag.privacy'),
      title: t('home.banner.privacy.title'),
      body: t('home.banner.privacy.body'),
      bodyDetail: t('home.banner.privacy.bodyDetail'),
    },
    about: {
      id: 'about',
      kind: 'static',
      accent: 'about',
      tag: t('home.banner.tag.about'),
      title: t('home.banner.about.title'),
      body: t('home.banner.about.body'),
      bodyDetail: t('home.banner.about.bodyDetail'),
    },
  }

  return BANNER_ORDER.map((id) => byId[id]).filter(Boolean)
}

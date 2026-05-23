const BANNER_ORDER = ['privacy', 'about']

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
 * @param {{
 *   t: (key: string, vars?: Record<string, string>) => string,
 * }} opts
 * @returns {Array<{
 *   id: string,
 *   kind: 'static',
 *   accent: string,
 *   tag: string,
 *   title: string,
 *   body: string,
 *   bodyDetail?: string,
 * }>}
 */
export function buildHomeBanners({ t }) {
  /** @type {Record<string, ReturnType<typeof buildHomeBanners>[number]>} */
  const byId = {
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

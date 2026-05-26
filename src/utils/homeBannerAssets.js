import bannerAboutBgRu from '../assets/banner.webp'
import bannerPrivacyBgRu from '../assets/banner2.webp'
import bannerAboutBgEn from '../assets/banner_eng.webp'
import bannerPrivacyBgEn from '../assets/banner2_eng.webp'

const BANNER_BG = {
  ru: { about: bannerAboutBgRu, privacy: bannerPrivacyBgRu },
  en: { about: bannerAboutBgEn, privacy: bannerPrivacyBgEn },
}

/**
 * @param {'ru' | 'en'} locale
 * @returns {{ about: string, privacy: string }}
 */
export function getBannerBgs(locale) {
  return BANNER_BG[locale] ?? BANNER_BG.ru
}

/** URL фонов баннеров на главной (для предзагрузки). */
export const HOME_BANNER_BG_URLS = [
  bannerAboutBgRu, bannerPrivacyBgRu,
  bannerAboutBgEn, bannerPrivacyBgEn,
]

export { bannerAboutBgRu as bannerAboutBg, bannerPrivacyBgRu as bannerPrivacyBg }

/**
 * @param {string[]} urls
 * @returns {Promise<void>}
 */
export function preloadBannerImages(urls) {
  if (urls.length === 0) return Promise.resolve()

  return Promise.all(
    urls.map(
      (src) =>
        new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => {
            if (typeof img.decode === 'function') {
              img.decode().then(resolve).catch(resolve)
            } else {
              resolve(undefined)
            }
          }
          img.onerror = () => reject(new Error(`Failed to load banner image: ${src}`))
          img.src = src
        }),
    ),
  ).then(() => undefined)
}

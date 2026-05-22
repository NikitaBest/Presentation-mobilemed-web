import bannerAboutBg from '../assets/banner.webp'
import bannerPrivacyBg from '../assets/banner2.webp'

/** URL фонов баннеров на главной (для предзагрузки и CSS). */
export const HOME_BANNER_BG_URLS = [bannerAboutBg, bannerPrivacyBg]

export { bannerAboutBg, bannerPrivacyBg }

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

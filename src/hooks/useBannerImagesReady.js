import { useEffect, useState } from 'react'
import { HOME_BANNER_BG_URLS, preloadBannerImages } from '../utils/homeBannerAssets.js'

/**
 * Предзагрузка PNG баннеров до показа карусели (без белой вспышки).
 * @returns {{ ready: boolean }}
 */
export function useBannerImagesReady() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    preloadBannerImages(HOME_BANNER_BG_URLS)
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch(() => {
        if (!cancelled) setReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { ready }
}

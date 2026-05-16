# Сканирование лица (BiosenseSignal Web SDK)

Зафиксированная рабочая конфигурация (май 2026). Не менять без проверки на реальном телефоне.

## Что должно остаться

| Параметр | Значение | Где |
|----------|----------|-----|
| Камера | `facingMode: 'user'`, `aspectRatio: { ideal: 9/16 }`, `width/height ideal 720×1280` | `ScanPage.jsx` → `FACE_CAMERA_VIDEO_CONSTRAINTS` |
| Превью | один `<video>`, `object-fit: cover`, зеркало `scaleX(-1)` | `ScanPage.css` → `.scan-video` |
| Ориентация сессии | `resolveSdkDeviceOrientation()` (не хардкод `PORTRAIT`) | `ScanPage.jsx` → `createFaceSession` |
| Строгий режим | `strictMeasurementGuidance: false` (дефолт SDK) | `ScanPage.jsx` |
| Вход SDK | тот же `<video ref>` → `input` в `createFaceSession` | `ScanPage.jsx` |
| WASM / потоки | COOP/COEP в `vite.config.js`, ассеты в `public/` через `sync-biosense-assets` | см. `docs/SDK.md` |
| Лицензия | `VITE_BIOSENSESIGNAL_LICENSE_KEY`, опционально `VITE_BIOSENSESIGNAL_PRODUCT_ID` | `.env` |

## Превью на мобильном

- Экран `.scan-page--fullscreen`: viewport на весь `100dvh`, видео `cover` по центру.
- До «Начать» и во время замера — **один и тот же** поток и стили (без отдельной логики превью).
- **SDK** берёт кадры из буфера `<video>` (`videoWidth` × `videoHeight`), не из CSS.

## ImageValidity

- `INVALID_ROI` в доке = «SDK не распознал лицо», не «овалы не совпали».
- Подсказки: `onImageData` в `MEASURING`; колбэк в `ACTIVE` часто не вызывается (Web SDK).

## Отладка

- Dev: логи `[Scan SDK]` из `scanSdkDebug.js`.
- Prod: `VITE_SCAN_SDK_DEBUG=1` в `.env`.

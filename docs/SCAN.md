# Сканирование лица (BiosenseSignal Web SDK)

Зафиксированная рабочая конфигурация (май 2026). Не менять без проверки на реальном телефоне.

## Что должно остаться

| Параметр | Значение | Где |
|----------|----------|-----|
| Камера | `facingMode: { ideal: 'user' }`, portrait ideal 720×1280, сброс zoom трека | `src/utils/faceCamera.js` |
| Превью | `contain` / `cover` по aspect потока vs экрана (без смены потока для SDK) | `faceCamera.js` + `.scan-video--*` |
| Ориентация сессии | `resolveSdkDeviceOrientation()` (не хардкод `PORTRAIT`) | `ScanPage.jsx` → `createFaceSession` |
| Строгий режим | `strictMeasurementGuidance: false` (дефолт SDK) | `ScanPage.jsx` |
| Вход SDK | один `<video ref>` → `input` в `createFaceSession` | `ScanPage.jsx` |
| WASM / потоки | COOP/COEP в `vite.config.js`, ассеты в `public/` через `sync-biosense-assets` | см. `docs/SDK.md` |
| Лицензия | `VITE_BIOSENSESIGNAL_LICENSE_KEY`, опционально `VITE_BIOSENSESIGNAL_PRODUCT_ID` | `.env` |

## Превью на весь экран

- **CSS:** `resolvePreviewObjectFit()` — при сильном расхождении aspect потока и экрана используется `contain` (иначе `cover` даёт «супер-зум» на телефоне до «Начать»).
- **SDK** берёт кадры из буфера `<video>` (`videoWidth` × `videoHeight`), не из CSS-обрезки.
- Смена `object-fit` не меняет поток камеры и не ломает `createFaceSession`.

## ImageValidity

- `INVALID_ROI` в доке = «SDK не распознал лицо», не «овалы не совпали».
- Подсказки: `onImageData` в `MEASURING`; колбэк в `ACTIVE` часто не вызывается (Web SDK).

## Отладка

- Dev: логи `[Scan SDK]` из `scanSdkDebug.js`.
- Prod: `VITE_SCAN_SDK_DEBUG=1` в `.env`.

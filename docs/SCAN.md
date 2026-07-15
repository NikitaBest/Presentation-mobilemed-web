# Сканирование лица (BiosenseSignal Web SDK)

Зафиксированная рабочая конфигурация (май 2026). Не менять без проверки на реальном телефоне.

## Что должно остаться

| Параметр | Значение | Где |
|----------|----------|-----|
| Камера | `facingMode: { ideal: 'user' }` (как Camera.jsx) | `ScanPage.jsx` |
| Превью | тот же `<video>`, `object-fit: cover`, зеркало `scaleX(-1)` | `ScanPage.css` |
| SDK до «Подготовить» | `createFaceSession` при входе на экран, **без** `session.start()` | `ScanPage.jsx` → `previewOnly` |
| Проверка позы (PGS) | «Подготовить положение» → `startPostureCheck()` из клика (iOS motion) | `ScanPage.jsx` |
| Старт замера | только при `CAPTURE_VALID` → «Начать замер» → `session.start()` | `ScanPage.jsx` |
| Ориентация сессии | `resolveSdkDeviceOrientation()` | `createFaceSession` |
| Строгий режим | `strictMeasurementGuidance: false` (вкл.: `VITE_STRICT_MEASUREMENT_GUIDANCE=true`) | `faceScan.js` → `ScanPage.jsx` |
| Вход SDK | тот же `<video ref>` → `input` | `ScanPage.jsx` |
| WASM / потоки | COOP/COEP, `sync-biosense-assets` | `docs/SDK.md` |
| Лицензия | `VITE_BIOSENSESIGNAL_*` | `.env` |

## Превью = тот же кадр, что при замере

До «Начать» и во время замера один поток камеры и одна SDK-сессия. Раньше камера работала без SDK → на телефоне другой crop/zoom; после `createFaceSession` картинка менялась. Теперь сессия создаётся сразу, `start()` — только по кнопке.

## ImageValidity

- `INVALID_ROI` = SDK не распознал лицо.
- Подсказки в `MEASURING` через `onImageData`.

## Прогресс овала

- Дуга: `elapsed / processingTime` от `MEASURING` до `STOPPING` (таймер SDK, без пауз).
- Цвет кольца и дуги = плашка кадра: `pending` (ожидание) / `ok` (VALID) / `warn` (поправьте лицо).

## Отладка

- Dev: `[Scan SDK]` в `scanSdkDebug.js`.
- Prod: `VITE_SCAN_SDK_DEBUG=1`.

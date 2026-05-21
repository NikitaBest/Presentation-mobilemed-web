import { useCallback, useMemo, useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { ChoiceCard } from '../components/ChoiceCard.jsx'
import { useI18n } from '../i18n/useI18n.js'
import {
  validateAgeField,
  validateHeightField,
  validateNameField,
  validateSexField,
  validateSmokingField,
  validateWeightField,
} from '../validation/bodyMetrics.js'
import { getStoredUserId } from '../api/session.js'
import { mapFormToUpdateUserRequest, mapUserEntityToFormPatch, putUserUpdate } from '../api/user.js'
import { saveUserDisplayName } from '../utils/userDisplayNameStorage.js'
import './UserDataPage.css'

const REQ = { required: true }

const IconMale = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 6C13.1046 6 14 5.10457 14 4C14 2.89543 13.1046 2 12 2C10.8954 2 10 2.89543 10 4C10 5.10457 10.8954 6 12 6Z"
      fill="currentColor"
    />
    <path
      d="M15 7H9C8.73478 7 8.48043 7.10536 8.29289 7.29289C8.10536 7.48043 8 7.73478 8 8V15H10V22H14V15H16V8C16 7.73478 15.8946 7.48043 15.7071 7.29289C15.5196 7.10536 15.2652 7 15 7Z"
      fill="currentColor"
    />
  </svg>
)

const IconFemale = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 6C13.1046 6 14 5.10457 14 4C14 2.89543 13.1046 2 12 2C10.8954 2 10 2.89543 10 4C10 5.10457 10.8954 6 12 6Z"
      fill="currentColor"
    />
    <path
      d="M14.948 7.684C14.8817 7.48496 14.7545 7.3118 14.5844 7.18905C14.4142 7.0663 14.2098 7.00016 14 7H10C9.79021 7.00016 9.58578 7.0663 9.41565 7.18905C9.24551 7.3118 9.1183 7.48496 9.052 7.684L7.052 13.684L8.827 14.277L8 18H10V22H14V18H16L15.173 14.276L16.948 13.683L14.948 7.684Z"
      fill="currentColor"
    />
  </svg>
)

const IconNonSmoker = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M2 6L9 13H2V16H12L19 23L20.25 21.75L3.25 4.75L2 6ZM20.5 13H22V16H20.5V13ZM18 13H19.5V16H18V13ZM18.85 4.88C19.47 4.27 19.85 3.43 19.85 2.5H18.35C18.35 3.5 17.5 4.35 16.5 4.35V5.85C18.74 5.85 20.5 7.68 20.5 9.92V12H22V9.92C22 7.69 20.72 5.77 18.85 4.88ZM14.5 8.7H16.03C17.08 8.7 18 9.44 18 10.75V12H19.5V10.41C19.5 8.61 17.9 7.25 16.03 7.25H14.5C13.5 7.25 12.65 6.27 12.65 5.25C12.65 4.23 13.5 3.5 14.5 3.5V2C13.6115 2 12.7594 2.35295 12.1312 2.98119C11.5029 3.60944 11.15 4.46152 11.15 5.35C11.15 6.23848 11.5029 7.09056 12.1312 7.71881C12.7594 8.34705 13.6115 8.7 14.5 8.7ZM17 15.93V13H14.07L17 15.93Z"
      fill="currentColor"
    />
  </svg>
)

const IconSmoker = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M2 16H17V19H2V16ZM20.5 16H22V19H20.5V16ZM18 16H19.5V19H18V16ZM18.85 7.73C19.47 7.12 19.85 6.28 19.85 5.35C19.85 3.5 18.35 2 16.5 2V3.5C17.5 3.5 18.35 4.33 18.35 5.35C18.35 6.37 17.5 7.2 16.5 7.2V8.7C18.74 8.7 20.5 10.53 20.5 12.77V15H22V12.76C22 10.54 20.72 8.62 18.85 7.73ZM16.03 10.2H14.5C13.5 10.2 12.65 9.22 12.65 8.2C12.65 7.18 13.5 6.45 14.5 6.45V4.95C13.6115 4.95 12.7594 5.30295 12.1312 5.93119C11.5029 6.55944 11.15 7.41152 11.15 8.3C11.15 9.18848 11.5029 10.0406 12.1312 10.6688C12.7594 11.2971 13.6115 11.65 14.5 11.65H16.03C17.08 11.65 18 12.39 18 13.7V15H19.5V13.36C19.5 11.55 17.9 10.2 16.03 10.2Z"
      fill="currentColor"
    />
  </svg>
)

function getAgeWordRu(n) {
  const lastDigit = n % 10
  const lastTwo = n % 100
  if (lastTwo >= 11 && lastTwo <= 14) return 'лет'
  if (lastDigit === 1) return 'год'
  if (lastDigit >= 2 && lastDigit <= 4) return 'года'
  return 'лет'
}

function parsePositiveInt(s) {
  const n = Number.parseInt(String(s), 10)
  return Number.isFinite(n) ? n : NaN
}

function parsePositiveFloat(s) {
  const n = Number.parseFloat(String(s).replace(',', '.'))
  return Number.isFinite(n) ? n : NaN
}

export function UserDataPage({
  value,
  onFormChange,
  onBack,
  onContinue,
  profileHint = '',
  /** @type {'flow' | 'profile'} */
  variant = 'flow',
}) {
  const { t, locale } = useI18n()
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [touched, setTouched] = useState({
    name: false,
    age: false,
    height: false,
    weight: false,
    sex: false,
    smokingStatus: false,
  })
  const [errors, setErrors] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    sex: '',
    smokingStatus: '',
  })

  const sexChoices = useMemo(
    () => [
      { value: 'MALE', label: t('userData.sexMale'), icon: IconMale },
      { value: 'FEMALE', label: t('userData.sexFemale'), icon: IconFemale },
    ],
    [t],
  )

  const smokingChoices = useMemo(
    () => [
      { value: 'NON_SMOKER', label: t('userData.smokingNon'), icon: IconNonSmoker },
      { value: 'SMOKER', label: t('userData.smokingYes'), icon: IconSmoker },
    ],
    [t],
  )

  const runAllValidation = useCallback(
    (v) => ({
      name: validateNameField(v.name, { ...REQ, t }),
      age: validateAgeField(v.age, { ...REQ, t }),
      height: validateHeightField(v.height, { ...REQ, t }),
      weight: validateWeightField(v.weight, { ...REQ, t }),
      sex: validateSexField(v.sex, t),
      smokingStatus: validateSmokingField(v.smokingStatus, t),
    }),
    [t],
  )

  const nameTrimmed = String(value.name ?? '').trim()
  const nameOk = !errors.name && nameTrimmed.length > 0

  const ageNum = parsePositiveInt(value.age)
  const ageOk =
    !errors.age && Number.isFinite(ageNum) && ageNum >= 1 && ageNum <= 120
  const heightNum = parsePositiveFloat(value.height)
  const weightNum = parsePositiveFloat(value.weight)
  const heightOk =
    !errors.height &&
    Number.isFinite(heightNum) &&
    heightNum >= 50 &&
    heightNum <= 260
  const weightOk =
    !errors.weight &&
    Number.isFinite(weightNum) &&
    weightNum >= 20 &&
    weightNum <= 300

  const selectSex = useCallback(
    (sex) => {
      onFormChange({ sex })
      setErrors((prev) => ({ ...prev, sex: '' }))
    },
    [onFormChange],
  )

  const selectSmokingStatus = useCallback(
    (smokingStatus) => {
      onFormChange({ smokingStatus })
      setErrors((prev) => ({ ...prev, smokingStatus: '' }))
    },
    [onFormChange],
  )

  const patchErrorsAfterChange = useCallback(
    (patch) => {
      onFormChange(patch)
      const merged = { ...value, ...patch }
      setErrors((prev) => {
        const next = { ...prev }
        if ('name' in patch && touched.name) {
          next.name = validateNameField(merged.name, { ...REQ, t })
        }
        if ('age' in patch && touched.age) {
          next.age = validateAgeField(merged.age, { ...REQ, t })
        }
        if ('height' in patch && touched.height) {
          next.height = validateHeightField(merged.height, { ...REQ, t })
        }
        if ('weight' in patch && touched.weight) {
          next.weight = validateWeightField(merged.weight, { ...REQ, t })
        }
        return next
      })
    },
    [onFormChange, touched.name, touched.age, touched.height, touched.weight, value, t],
  )

  return (
    <AppLayout>
      <div className="user-data-page page-shell">
        <header className="user-data-header">
          <h1 className="user-data-title">{t('userData.title')}</h1>
          <p className="user-data-lead">
            {t('userData.lead')}
          </p>
          {profileHint ? (
            <p className="user-data-lead user-data-lead--warn" role="status">
              {profileHint}
            </p>
          ) : null}
        </header>

        <form
          className="user-data-content page-shell__scroll"
          id="user-data-form"
          autoComplete="off"
          onSubmit={async (e) => {
            e.preventDefault()
            const nextErrors = runAllValidation(value)
            setErrors(nextErrors)
            setTouched({
              name: true,
              age: true,
              height: true,
              weight: true,
              sex: true,
              smokingStatus: true,
            })
            if (
              nextErrors.name ||
              nextErrors.age ||
              nextErrors.height ||
              nextErrors.weight ||
              nextErrors.sex ||
              nextErrors.smokingStatus
            ) {
              return
            }
            setSaveError('')
            setSaving(true)
            try {
              const updated = await putUserUpdate(mapFormToUpdateUserRequest(value))
              saveUserDisplayName(getStoredUserId(), nameTrimmed)
              if (updated) {
                const patch = mapUserEntityToFormPatch(updated)
                if (Object.keys(patch).length > 0) {
                  onFormChange(patch)
                }
              }
              onFormChange({ name: nameTrimmed })
              onContinue()
            } catch (err) {
              setSaveError(
                err instanceof Error ? err.message : t('userData.saveError'),
              )
            } finally {
              setSaving(false)
            }
          }}
        >
          <section className="user-data-section" aria-labelledby="uds-name">
            <h2 className="user-data-section-title" id="uds-name">
              {t('userData.nameTitle')}
            </h2>
            <p className="user-data-section-subtitle">{t('userData.nameSubtitle')}</p>
            <input
              id="user-name"
              className={`user-data-input${errors.name ? ' user-data-input--error' : ''}`}
              type="text"
              inputMode="text"
              autoComplete="name"
              placeholder={t('userData.namePlaceholder')}
              value={value.name}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'user-name-error' : undefined}
              onChange={(e) => patchErrorsAfterChange({ name: e.target.value })}
              onBlur={(e) => {
                setTouched((t) => ({ ...t, name: true }))
                setErrors((prev) => ({
                  ...prev,
                  name: validateNameField(e.target.value, { ...REQ, t }),
                }))
              }}
            />
            {errors.name ? (
              <p id="user-name-error" className="user-data-field-error" role="alert">
                {errors.name}
              </p>
            ) : null}
            {nameOk ? (
              <div className="user-data-note">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{t('userData.nameNote')}</span>
              </div>
            ) : null}
          </section>

          <section className="user-data-section" aria-labelledby="uds-sex">
            <h2 className="user-data-section-title" id="uds-sex">
              {t('userData.sexTitle')}
            </h2>
            <p className="user-data-section-subtitle">
              {t('userData.sexSubtitle')}
            </p>
            <div
              className={`user-data-choice-row${errors.sex ? ' user-data-choice-row--error' : ''}`}
              role="group"
              aria-labelledby="uds-sex"
              aria-invalid={Boolean(errors.sex)}
              aria-describedby={errors.sex ? 'uds-sex-error' : undefined}
            >
              {sexChoices.map((opt) => (
                <ChoiceCard
                  key={opt.value}
                  label={opt.label}
                  icon={opt.icon}
                  value={opt.value}
                  selected={value.sex === opt.value}
                  onClick={selectSex}
                />
              ))}
            </div>
            {errors.sex ? (
              <p id="uds-sex-error" className="user-data-field-error" role="alert">
                {errors.sex}
              </p>
            ) : null}
            {(value.sex === 'MALE' || value.sex === 'FEMALE') && (
              <div className="user-data-note">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{t('userData.sexNote')}</span>
              </div>
            )}
          </section>

          <section className="user-data-section" aria-labelledby="uds-age">
            <h2 className="user-data-section-title" id="uds-age">
              {t('userData.ageTitle')}
            </h2>
            <p className="user-data-section-subtitle">
              {t('userData.ageSubtitle')}
            </p>
            <input
              id="user-age"
              className={`user-data-input${errors.age ? ' user-data-input--error' : ''}`}
              type="text"
              inputMode="numeric"
              autoComplete="bday-year"
              placeholder={t('userData.agePlaceholder')}
              value={value.age}
              aria-invalid={Boolean(errors.age)}
              aria-describedby={errors.age ? 'user-age-error' : undefined}
              onChange={(e) => patchErrorsAfterChange({ age: e.target.value })}
              onBlur={(e) => {
                setTouched((t) => ({ ...t, age: true }))
                setErrors((prev) => ({
                  ...prev,
                  age: validateAgeField(e.target.value, { ...REQ, t }),
                }))
              }}
            />
            {errors.age ? (
              <p id="user-age-error" className="user-data-field-error" role="alert">
                {errors.age}
              </p>
            ) : null}
            {ageOk && (
              <div className="user-data-note">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>
                  {locale === 'en'
                    ? t('userData.ageLineEn', {
                        count: String(ageNum),
                        years: ageNum === 1 ? 'year' : 'years',
                      })
                    : `${ageNum} ${getAgeWordRu(ageNum)} ${t('userData.ageSavedSuffix')}`}
                </span>
              </div>
            )}
          </section>

          <section className="user-data-section" aria-labelledby="uds-body">
            <h2 className="user-data-section-title" id="uds-body">
              {t('userData.heightWeightTitle')}
            </h2>
            <p className="user-data-section-subtitle">
              {t('userData.heightWeightSubtitle')}
            </p>
            <div className="user-data-physical">
              <div className="user-data-physical-field">
                <label className="user-data-field-label" htmlFor="user-height">
                  {t('userData.heightLabel')}
                </label>
                <input
                  id="user-height"
                  className={`user-data-input${errors.height ? ' user-data-input--error' : ''}`}
                  type="text"
                  inputMode="numeric"
                  placeholder="170"
                  value={value.height}
                  aria-invalid={Boolean(errors.height)}
                  aria-describedby={
                    errors.height ? 'user-height-error' : undefined
                  }
                  onChange={(e) =>
                    patchErrorsAfterChange({ height: e.target.value })
                  }
                  onBlur={(e) => {
                    setTouched((t) => ({ ...t, height: true }))
                    setErrors((prev) => ({
                      ...prev,
                      height: validateHeightField(e.target.value, { ...REQ, t }),
                    }))
                  }}
                />
                {errors.height ? (
                  <p
                    id="user-height-error"
                    className="user-data-field-error"
                    role="alert"
                  >
                    {errors.height}
                  </p>
                ) : null}
              </div>
              <div className="user-data-physical-field">
                <label className="user-data-field-label" htmlFor="user-weight">
                  {t('userData.weightLabel')}
                </label>
                <input
                  id="user-weight"
                  className={`user-data-input${errors.weight ? ' user-data-input--error' : ''}`}
                  type="text"
                  inputMode="decimal"
                  placeholder="70"
                  value={value.weight}
                  aria-invalid={Boolean(errors.weight)}
                  aria-describedby={
                    errors.weight ? 'user-weight-error' : undefined
                  }
                  onChange={(e) =>
                    patchErrorsAfterChange({ weight: e.target.value })
                  }
                  onBlur={(e) => {
                    setTouched((t) => ({ ...t, weight: true }))
                    setErrors((prev) => ({
                      ...prev,
                      weight: validateWeightField(e.target.value, { ...REQ, t }),
                    }))
                  }}
                />
                {errors.weight ? (
                  <p
                    id="user-weight-error"
                    className="user-data-field-error"
                    role="alert"
                  >
                    {errors.weight}
                  </p>
                ) : null}
              </div>
            </div>
            {value.height !== '' &&
              value.weight !== '' &&
              heightOk &&
              weightOk && (
                <div className="user-data-note">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path
                      d="M13.3333 4L6 11.3333L2.66667 8"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{t('userData.heightOk')}</span>
                </div>
              )}
          </section>

          <section className="user-data-section" aria-labelledby="uds-smoke">
            <h2 className="user-data-section-title" id="uds-smoke">
              {t('userData.smokingTitle')}
            </h2>
            <p className="user-data-section-subtitle">
              {t('userData.smokingSubtitle')}
            </p>
            <div
              className={`user-data-choice-row${errors.smokingStatus ? ' user-data-choice-row--error' : ''}`}
              role="group"
              aria-labelledby="uds-smoke"
              aria-invalid={Boolean(errors.smokingStatus)}
              aria-describedby={
                errors.smokingStatus ? 'uds-smoke-error' : undefined
              }
            >
              {smokingChoices.map((opt) => (
                <ChoiceCard
                  key={opt.value}
                  label={opt.label}
                  icon={opt.icon}
                  value={opt.value}
                  selected={value.smokingStatus === opt.value}
                  onClick={selectSmokingStatus}
                />
              ))}
            </div>
            {errors.smokingStatus ? (
              <p
                id="uds-smoke-error"
                className="user-data-field-error"
                role="alert"
              >
                {errors.smokingStatus}
              </p>
            ) : null}
            {value.smokingStatus === 'NON_SMOKER' && (
              <div className="user-data-note">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{t('userData.smokingNoteNon')}</span>
              </div>
            )}
            {value.smokingStatus === 'SMOKER' && (
              <div className="user-data-note">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{t('userData.smokingNoteYes')}</span>
              </div>
            )}
          </section>
        </form>

        <footer className="page-dock user-data-footer">
          {saveError ? (
            <p className="user-data-field-error user-data-save-error" role="alert">
              {saveError}
            </p>
          ) : null}
          <div className="page-footer--row">
            <button
              type="button"
              className="btn-secondary"
              onClick={onBack}
              disabled={saving}
            >
              {t('common.back')}
            </button>
            <button
              type="submit"
              className="btn-primary"
              form="user-data-form"
              disabled={saving}
            >
              {saving
                ? t('userData.saving')
                : variant === 'profile'
                  ? t('home.profileSave')
                  : t('userData.next')}
            </button>
          </div>
          {variant === 'flow' ? (
            <p className="user-data-footer-hint">{t('userData.footerHint')}</p>
          ) : null}
        </footer>
      </div>
    </AppLayout>
  )
}

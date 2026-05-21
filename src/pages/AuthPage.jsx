import { useCallback, useMemo, useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { postAuthLogin, postAuthRegister } from '../api/auth.js'
import { getStoredEmail } from '../api/session.js'
import { useI18n } from '../i18n/useI18n.js'
import {
  validateAuthEmailField,
  validateAuthPasswordField,
} from '../validation/authCredentials.js'
import './AuthPage.css'

const REQ = { required: true }

const MODES = [
  { id: 'login', labelKey: 'auth.tabLogin' },
  { id: 'register', labelKey: 'auth.tabRegister' },
]

/**
 * @param {{
 *   onSuccess: () => void,
 *   onBackToLanguage?: () => void,
 * }} props
 */
export function AuthPage({ onSuccess, onBackToLanguage }) {
  const { t } = useI18n()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState(() => getStoredEmail())
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [touched, setTouched] = useState({ email: false, password: false })
  const [errors, setErrors] = useState({ email: '', password: '' })

  const isRegister = mode === 'register'

  const headerCopy = useMemo(
    () => ({
      title: isRegister ? t('auth.titleRegister') : t('auth.titleLogin'),
      lead: isRegister ? t('auth.leadRegister') : t('auth.leadLogin'),
      hint: t('auth.hint'),
    }),
    [isRegister, t],
  )

  const runValidation = useCallback(
    () => ({
      email: validateAuthEmailField(email, { ...REQ, t }),
      password: validateAuthPasswordField(password, { ...REQ, t }),
    }),
    [email, password, t],
  )

  const switchMode = useCallback((next) => {
    setMode(next)
    setFormError('')
    setErrors({ email: '', password: '' })
    setTouched({ email: false, password: false })
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      const nextErrors = runValidation()
      setErrors(nextErrors)
      setTouched({ email: true, password: true })
      if (nextErrors.email || nextErrors.password) return

      setFormError('')
      setSubmitting(true)
      try {
        const payload = { email: email.trim(), password }
        if (isRegister) {
          await postAuthRegister(payload)
        } else {
          await postAuthLogin(payload)
        }
        onSuccess()
      } catch (err) {
        setFormError(err instanceof Error ? err.message : t('auth.errorGeneric'))
      } finally {
        setSubmitting(false)
      }
    },
    [email, isRegister, onSuccess, password, runValidation, t],
  )

  return (
    <AppLayout>
      <div className="auth-page page-shell">
        <div className="auth-page__body page-shell__scroll">
          <header className="auth-page__header">
            <span className="auth-page__brand">{t('auth.brand')}</span>
            <h1 className="auth-page__title">{headerCopy.title}</h1>
            <p className="auth-page__lead">{headerCopy.lead}</p>
            <p className="auth-page__hint">{headerCopy.hint}</p>
          </header>

          <form
            id="auth-form"
            className="auth-page__form-card"
            autoComplete="on"
            onSubmit={handleSubmit}
          >
            <div className="auth-page__field">
              <label className="auth-page__label" htmlFor="auth-email">
                {t('auth.emailLabel')}
              </label>
              <input
                id="auth-email"
                className={`auth-page__input${errors.email ? ' auth-page__input--error' : ''}`}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                disabled={submitting}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'auth-email-error' : undefined}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (touched.email) {
                    setErrors((prev) => ({
                      ...prev,
                      email: validateAuthEmailField(e.target.value, { ...REQ, t }),
                    }))
                  }
                }}
                onBlur={(e) => {
                  setTouched((s) => ({ ...s, email: true }))
                  setErrors((prev) => ({
                    ...prev,
                    email: validateAuthEmailField(e.target.value, { ...REQ, t }),
                  }))
                }}
              />
              {errors.email ? (
                <p id="auth-email-error" className="auth-page__field-error" role="alert">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="auth-page__field auth-page__field--last">
              <label className="auth-page__label" htmlFor="auth-password">
                {t('auth.passwordLabel')}
              </label>
              <input
                id="auth-password"
                className={`auth-page__input${errors.password ? ' auth-page__input--error' : ''}`}
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                disabled={submitting}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'auth-password-error' : undefined}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (touched.password) {
                    setErrors((prev) => ({
                      ...prev,
                      password: validateAuthPasswordField(e.target.value, { ...REQ, t }),
                    }))
                  }
                }}
                onBlur={(e) => {
                  setTouched((s) => ({ ...s, password: true }))
                  setErrors((prev) => ({
                    ...prev,
                    password: validateAuthPasswordField(e.target.value, { ...REQ, t }),
                  }))
                }}
              />
              {errors.password ? (
                <p id="auth-password-error" className="auth-page__field-error" role="alert">
                  {errors.password}
                </p>
              ) : null}
            </div>
          </form>

          <div
            className="auth-page__switch"
            role="tablist"
            aria-label={t('auth.tabsAria')}
          >
            {MODES.map((item) => {
              const active = mode === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`auth-page__switch-btn${active ? ' auth-page__switch-btn--active' : ''}`}
                  disabled={submitting}
                  onClick={() => switchMode(item.id)}
                >
                  {t(item.labelKey)}
                </button>
              )
            })}
          </div>

          {formError ? (
            <p className="auth-page__error" role="alert">
              {formError}
            </p>
          ) : null}
        </div>

        <footer className="page-dock auth-page__dock">
          <button
            type="submit"
            className="btn-primary"
            form="auth-form"
            disabled={submitting}
          >
            {submitting
              ? t('auth.submitting')
              : isRegister
                ? t('auth.submitRegister')
                : t('auth.submitLogin')}
          </button>
          {onBackToLanguage ? (
            <button
              type="button"
              className="auth-page__secondary"
              disabled={submitting}
              onClick={onBackToLanguage}
            >
              {t('auth.changeLanguage')}
            </button>
          ) : null}
        </footer>
      </div>
    </AppLayout>
  )
}

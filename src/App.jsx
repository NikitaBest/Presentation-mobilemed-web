import { useCallback, useEffect, useState } from 'react'
import { ensureAuthSession } from './api/auth.js'
import { getUserMe, mapUserEntityToFormPatch } from './api/user.js'
import { WelcomePage } from './pages/WelcomePage.jsx'
import { UserDataPage } from './pages/UserDataPage.jsx'
import { ScanInstructionPage } from './pages/ScanInstructionPage.jsx'
import { ScanPage } from './pages/ScanPage.jsx'
import { ResultsPage } from './pages/ResultsPage.jsx'
import { USER_FORM_INITIAL } from './sdk/userInformation.js'
import { APP_STEPS, readPersistedStep, writePersistedStep } from './utils/appStepStorage.js'
import './App.css'

export default function App() {
  const [step, setStep] = useState(() => readPersistedStep())
  const [userForm, setUserForm] = useState(() => ({ ...USER_FORM_INITIAL }))
  const [scanSummary, setScanSummary] = useState(null)
  const [authStatus, setAuthStatus] = useState('loading')
  const [authError, setAuthError] = useState('')
  const [userDataHint, setUserDataHint] = useState('')

  const runAuth = useCallback(async () => {
    setAuthStatus('loading')
    setAuthError('')
    try {
      await ensureAuthSession()
      setAuthStatus('ready')
    } catch (e) {
      setAuthStatus('error')
      setAuthError(e instanceof Error ? e.message : 'Ошибка подключения')
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- инициализация сессии при монтировании
    runAuth()
  }, [runAuth])

  useEffect(() => {
    writePersistedStep(step)
  }, [step])

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- загрузка /user/me при входе на шаг */
    if (step !== 'userData') return
    let cancelled = false
    setUserDataHint('')
    ;(async () => {
      try {
        const user = await getUserMe()
        if (cancelled || !user) return
        const patch = mapUserEntityToFormPatch(user)
        if (Object.keys(patch).length > 0) {
          setUserForm((prev) => ({ ...prev, ...patch }))
        }
      } catch (e) {
        if (!cancelled) {
          setUserDataHint(
            e instanceof Error
              ? e.message
              : 'Не удалось загрузить сохранённые данные',
          )
        }
      }
    })()
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      cancelled = true
    }
  }, [step])

  const patchUserForm = useCallback((patch) => {
    setUserForm((prev) => ({ ...prev, ...patch }))
  }, [])

  const goNext = useCallback(() => {
    setStep((current) => {
      const i = APP_STEPS.indexOf(current)
      if (i < 0 || i >= APP_STEPS.length - 1) return current
      return APP_STEPS[i + 1]
    })
  }, [])

  const goBack = useCallback(() => {
    setStep((current) => {
      const i = APP_STEPS.indexOf(current)
      if (i <= 0) return current
      return APP_STEPS[i - 1]
    })
  }, [])

  return (
    <div className="app-root">
      {step === 'welcome' && (
        <WelcomePage
          authStatus={authStatus}
          authError={authError}
          onRetryAuth={runAuth}
          onContinue={goNext}
        />
      )}
      {step === 'userData' && (
        <UserDataPage
          value={userForm}
          onFormChange={patchUserForm}
          onBack={goBack}
          onContinue={goNext}
          profileHint={userDataHint}
        />
      )}
      {step === 'instruction' && (
        <ScanInstructionPage onBack={goBack} onContinue={goNext} />
      )}
      {step === 'scan' && (
        <ScanPage
          userForm={userForm}
          onBack={goBack}
          onContinue={goNext}
          onSaved={setScanSummary}
        />
      )}
      {step === 'results' && (
        <ResultsPage
          onGoHome={() => setStep('welcome')}
          onMeasureAgain={() => setStep('instruction')}
          scanSummary={scanSummary}
        />
      )}
    </div>
  )
}

import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { ensureAuthSession } from './api/auth.js'
import { getUserMe, mapUserEntityToFormPatch } from './api/user.js'
import { AppStepTransition } from './components/AppStepTransition.jsx'
import { LanguageSelectPage } from './pages/LanguageSelectPage.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { WelcomePage } from './pages/WelcomePage.jsx'
import { UserDataPage } from './pages/UserDataPage.jsx'
import { ScanInstructionPage } from './pages/ScanInstructionPage.jsx'
import { ResultsPage } from './pages/ResultsPage.jsx'
import { SettingsPage } from './pages/SettingsPage.jsx'
const ScanPage = lazy(() =>
  import('./pages/ScanPage.jsx').then((m) => ({ default: m.ScanPage })),
)
import { USER_FORM_INITIAL } from './sdk/userInformation.js'
import {
  APP_STEPS,
  HOME_STEP,
  LANGUAGE_STEP,
  SETTINGS_STEP,
  readInitialStep,
  writePersistedStep,
} from './utils/appStepStorage.js'
import { useI18n } from './i18n/useI18n.js'
import './App.css'

export default function App() {
  const { t } = useI18n()
  const [step, setStep] = useState(() => readInitialStep())
  const [userForm, setUserForm] = useState(() => ({ ...USER_FORM_INITIAL }))
  const [scanSummary, setScanSummary] = useState(null)
  const [authStatus, setAuthStatus] = useState('loading')
  const [authError, setAuthError] = useState('')
  const [userDataHint, setUserDataHint] = useState('')
  const [returnStep, setReturnStep] = useState(HOME_STEP)
  /** @type {'flow' | 'profile'} */
  const [userDataVariant, setUserDataVariant] = useState('flow')

  const runAuth = useCallback(async () => {
    setAuthStatus('loading')
    setAuthError('')
    try {
      await ensureAuthSession()
      setAuthStatus('ready')
    } catch (e) {
      setAuthStatus('error')
      setAuthError(e instanceof Error ? e.message : t('app.authError'))
    }
  }, [t])

  useEffect(() => {
    if (step === LANGUAGE_STEP) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- сессия после выбора языка
    runAuth()
  }, [runAuth, step])

  useEffect(() => {
    if (step === LANGUAGE_STEP || step === SETTINGS_STEP) return
    writePersistedStep(step)
  }, [step])

  const completeLanguageStep = useCallback(() => {
    setStep(HOME_STEP)
  }, [])

  const openSettings = useCallback((fromStep = HOME_STEP) => {
    setReturnStep(fromStep)
    setStep(SETTINGS_STEP)
  }, [])

  const closeSettings = useCallback(() => {
    setStep(returnStep)
  }, [returnStep])

  const startScanFlow = useCallback(() => {
    setStep('welcome')
  }, [])

  const openScanFromHistory = useCallback((row) => {
    const scanId = row?.scan?.id ?? row?.rppgScanId ?? null
    setScanSummary(scanId ? { value: { scan: { id: scanId } } } : null)
    setStep('results')
  }, [])

  useEffect(() => {
    if (step === 'instruction') {
      void import('./pages/ScanPage.jsx')
    }
  }, [step])

  const loadUserProfile = useCallback(async () => {
    try {
      const user = await getUserMe()
      if (!user) return
      const patch = mapUserEntityToFormPatch(user)
      if (Object.keys(patch).length > 0) {
        setUserForm((prev) => ({ ...prev, ...patch }))
      }
    } catch (e) {
      setUserDataHint(e instanceof Error ? e.message : t('app.profileLoadError'))
    }
  }, [t])

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- загрузка /user/me на главной и в анкете */
    if (step !== HOME_STEP && step !== 'userData') return
    setUserDataHint('')
    void loadUserProfile()
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [step, loadUserProfile])

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

  const goHome = useCallback(() => {
    setStep(HOME_STEP)
  }, [])

  const openEditProfile = useCallback(() => {
    setUserDataVariant('profile')
    setStep('userData')
  }, [])

  const finishUserDataProfile = useCallback(() => {
    setUserDataVariant('flow')
    setStep(HOME_STEP)
  }, [])

  const finishUserDataFlow = useCallback(() => {
    setUserDataVariant('flow')
    goNext()
  }, [goNext])

  const cancelUserDataProfile = useCallback(() => {
    setUserDataVariant('flow')
    goHome()
  }, [goHome])

  const renderStep = (activeStep) => (
    <>
      {activeStep === LANGUAGE_STEP && (
        <LanguageSelectPage onComplete={completeLanguageStep} />
      )}
      {activeStep === HOME_STEP && (
        <HomePage
          userForm={userForm}
          onStartScan={startScanFlow}
          onOpenSettings={() => openSettings(HOME_STEP)}
          onOpenScan={openScanFromHistory}
          onEditProfile={openEditProfile}
        />
      )}
      {activeStep === 'welcome' && (
        <WelcomePage
          authStatus={authStatus}
          authError={authError}
          onRetryAuth={runAuth}
          onContinue={goNext}
          onBack={goHome}
        />
      )}
      {activeStep === 'userData' && (
        <UserDataPage
          value={userForm}
          onFormChange={patchUserForm}
          variant={userDataVariant}
          onBack={userDataVariant === 'profile' ? cancelUserDataProfile : goBack}
          onContinue={
            userDataVariant === 'profile' ? finishUserDataProfile : finishUserDataFlow
          }
          profileHint={userDataHint}
        />
      )}
      {activeStep === 'instruction' && (
        <ScanInstructionPage onBack={goBack} onContinue={goNext} />
      )}
      {activeStep === 'scan' && (
        <Suspense fallback={<div className="app-loading app-loading--fade">{t('app.scanLoading')}</div>}>
          <ScanPage
            userForm={userForm}
            onBack={goBack}
            onContinue={goNext}
            onSaved={setScanSummary}
          />
        </Suspense>
      )}
      {activeStep === 'results' && (
        <ResultsPage
          onGoHome={goHome}
          onMeasureAgain={() => setStep('instruction')}
          scanSummary={scanSummary}
        />
      )}
      {activeStep === SETTINGS_STEP && (
        <SettingsPage onBack={closeSettings} />
      )}
    </>
  )

  return (
    <div className="app-root">
      <AppStepTransition step={step}>{renderStep}</AppStepTransition>
    </div>
  )
}

import { useContext } from 'react'
import { I18nContext } from './I18nContext.js'

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n: оберните приложение в <I18nProvider>')
  }
  return ctx
}

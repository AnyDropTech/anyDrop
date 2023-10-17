import { invoke } from '@tauri-apps/api'
import { TauriEvent } from '@tauri-apps/api/event'
import { useCallback, useEffect, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const themeChanged = () => useCallback(async () => {
    const themeRs = await invoke<'light' | 'dark'>(TauriEvent.WINDOW_THEME_CHANGED, { label: 'main' })
    setTheme(themeRs)
  }, [setTheme])

  const getCurrentTheme = useCallback(async () => {
    const themeRs = await invoke<'light' | 'dark'>('theme', { label: 'main' })
    setTheme(themeRs)
  }, [setTheme])

  useEffect(() => {
    themeChanged()
    getCurrentTheme()
  }, [themeChanged])

  return theme
}

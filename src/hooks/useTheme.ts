import { event, invoke } from '@tauri-apps/api'
import { TauriEvent } from '@tauri-apps/api/event'
import { useCallback, useEffect, useState } from 'react'
import { throttle } from 'throttle-debounce'

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const themeChanged = useCallback(async () => {
    const themeRs = await event.listen(TauriEvent.WINDOW_THEME_CHANGED, throttle(500, (event) => {
      const _theme = event.payload as 'light' | 'dark'
      setTheme(_theme)
    }))
    return themeRs
  }, [setTheme])

  const getCurrentTheme = useCallback(async () => {
    const themeRs = await invoke<'light' | 'dark'>('get_current_window_theme', { label: 'main' })
    setTheme(themeRs)
  }, [setTheme])

  useEffect(() => {
    const destroyed = themeChanged()
    getCurrentTheme()

    return () => {
      destroyed.then(des => des())
    }
  }, [themeChanged])

  return {
    currentTheme: theme,
    themeChanged,
    getCurrentTheme,
  }
}

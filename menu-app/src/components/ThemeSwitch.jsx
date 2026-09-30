import { useEffect, useState } from 'react'

const THEME_STORAGE_KEY = 'menu-app-theme'

function getSavedTheme() {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  return savedTheme === 'dark' ? 'dark' : 'light'
}

function ThemeSwitch() {
  const [theme, setTheme] = useState(getSavedTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  return (
    <div className="theme-switch" aria-label="화면 테마 선택" role="group">
      <button
        aria-pressed={theme === 'light'}
        className={`theme-option caption1 bold ${
          theme === 'light' ? 'active' : ''
        }`}
        onClick={() => setTheme('light')}
        type="button"
      >
        Light
      </button>
      <button
        aria-pressed={theme === 'dark'}
        className={`theme-option caption1 bold ${
          theme === 'dark' ? 'active' : ''
        }`}
        onClick={() => setTheme('dark')}
        type="button"
      >
        Dark
      </button>
    </div>
  )
}

export default ThemeSwitch

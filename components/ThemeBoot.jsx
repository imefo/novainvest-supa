'use client'
import { useEffect } from 'react'

export default function ThemeBoot() {
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('nova_theme') : null
    const theme = saved === 'theme-gold' ? 'theme-gold' : 'theme-purple'

    const el = document.documentElement
    el.classList.remove('theme-purple', 'theme-gold')
    el.classList.add(theme)
  }, [])

  return null
}

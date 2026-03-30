'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-11 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        disabled
      >
        <Sun className="w-5 h-5" />
      </Button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="h-11 w-11 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </Button>
  )
}

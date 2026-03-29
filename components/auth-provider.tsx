'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { isAuthenticated, logout as logoutStorage } from '@/lib/db'
import { LoginScreen } from './login-screen'

interface AuthContextType {
  isLoggedIn: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const authStatus = await isAuthenticated()
      setIsLoggedIn(authStatus)
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const logout = async () => {
    await logoutStorage()
    setIsLoggedIn(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

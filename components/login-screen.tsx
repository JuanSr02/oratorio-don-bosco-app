'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login } from '@/lib/db'
import { loginSchema, type LoginFormData } from '@/lib/schemas'

interface LoginScreenProps {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError('')
    const { error } = await login(data.email, data.password)
    if (!error) {
      onLogin()
    } else {
      setServerError('Email o contraseña incorrectos. Verificá tus datos.')
    }
  }

  return (
    <div className="login-bg min-h-screen flex flex-col items-center justify-center p-4 pt-safe-top pb-safe-bottom">
      {/* Decorative blobs */}
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl overflow-hidden shadow-lg shadow-primary/40 mb-5 rotate-3 hover:rotate-0 transition-transform duration-300">
            <Image
              src="/icon-512x512.png"
              alt="Don Bosco"
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Oratorio Don Bosco
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Sistema de Gestión · Salesianos</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-7 shadow-2xl space-y-5">
          <h2 className="text-lg font-semibold text-foreground text-center">Iniciar sesión</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground/80">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  {...register('email')}
                  className={`pl-10 h-12 text-base transition-all ${
                    errors.email
                      ? 'border-destructive focus-visible:ring-destructive/30'
                      : 'focus-visible:ring-primary/30'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1 text-xs text-destructive mt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground/80">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  className={`pl-10 pr-10 h-12 text-base transition-all ${
                    errors.password
                      ? 'border-destructive focus-visible:ring-destructive/30'
                      : 'focus-visible:ring-primary/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1 text-xs text-destructive mt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{serverError}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold rounded-xl shadow-md shadow-primary/30 hover:shadow-primary/50 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="loader-spin w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                  Ingresando...
                </span>
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Salesianos de Don Bosco · {new Date().getFullYear()}
        </p>
        <p className="text-center text-[10px] text-muted-foreground/50 mt-1">
          Desarrollado por Juan Manuel Sanchez
        </p>
      </div>
    </div>
  )
}

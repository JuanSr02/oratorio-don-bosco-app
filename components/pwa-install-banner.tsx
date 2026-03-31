'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

type Platform = 'android' | 'ios' | null

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'pwa-install-dismissed'

export function PWAInstallBanner() {
  const [platform, setPlatform] = useState<Platform>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    // 1. Ya está instalada como PWA → no mostrar nada
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) return

    // 2. Si ya lo descartó antes → no molestar
    if (sessionStorage.getItem(DISMISSED_KEY)) return

    const ua = navigator.userAgent

    // 3. Detectar iOS (iPhone / iPad / iPod)
    const isIOS = /iphone|ipad|ipod/i.test(ua)
    // En iOS Safari el standalone aún no está activo, y Chrome/Firefox no soportan la instalación
    const isIOSSafari = isIOS && !/CriOS|FxiOS|OPiOS/i.test(ua)

    if (isIOSSafari) {
      setPlatform('ios')
      setVisible(true)
      return
    }

    // 4. Detectar Android — esperar beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setPlatform('android')
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    setInstalling(true)
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    } else {
      setInstalling(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Instalar aplicación"
      className="pwa-banner"
      id="pwa-install-banner"
    >
      {/* Fondo glassmorphism */}
      <div className="pwa-banner__inner">
        {/* Header */}
        <div className="pwa-banner__header">
          <div className="pwa-banner__app-info">
            <div className="pwa-banner__icon-wrap">
              <Image
                src="/icon-192x192.png"
                alt="Oratorio Don Bosco"
                width={48}
                height={48}
                className="pwa-banner__icon"
              />
            </div>
            <div>
              <p className="pwa-banner__app-name">Oratorio Don Bosco</p>
              <span className="pwa-banner__pwa-badge">
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <circle cx="5" cy="5" r="4" fill="currentColor" opacity=".3" />
                  <circle cx="5" cy="5" r="2" fill="currentColor" />
                </svg>
                PWA — Aplicación instalable
              </span>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="pwa-banner__close"
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Contenido según plataforma */}
        {platform === 'android' && (
          <div className="pwa-banner__body">
            <p className="pwa-banner__description">
              Agregá la app a tu pantalla de inicio para acceder más rápido, sin necesidad de abrir el navegador.
            </p>
            <div className="pwa-banner__actions">
              <button
                onClick={handleDismiss}
                className="pwa-banner__btn pwa-banner__btn--ghost"
              >
                Ahora no
              </button>
              <button
                onClick={handleInstall}
                disabled={installing}
                className="pwa-banner__btn pwa-banner__btn--primary"
                id="pwa-install-btn"
              >
                {installing ? (
                  <>
                    <span className="pwa-banner__spinner" aria-hidden="true" />
                    Instalando…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 16l-4-4h2.5V4h3v8H16l-4 4z" fill="currentColor" />
                      <path d="M20 18H4v2h16v-2z" fill="currentColor" />
                    </svg>
                    Instalar app
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {platform === 'ios' && (
          <div className="pwa-banner__body">
            <p className="pwa-banner__description">
              Instalá esta app en tu iPhone para un acceso más rápido y una mejor experiencia:
            </p>
            <ol className="pwa-banner__steps">
              <li className="pwa-banner__step">
                <span className="pwa-banner__step-num">1</span>
                <span>
                  Tocá el botón{' '}
                  <strong>Compartir</strong>{' '}
                  <span className="pwa-banner__share-icon" aria-label="ícono compartir">
                    {/* SF Symbols–style share icon inline */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 2v13M7 7l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5 12v7a1 1 0 001 1h12a1 1 0 001-1v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>{' '}
                  en Safari
                </span>
              </li>
              <li className="pwa-banner__step">
                <span className="pwa-banner__step-num">2</span>
                <span>
                  Seleccioná <strong>&quot;Agregar a pantalla de inicio&quot;</strong>
                </span>
              </li>
              <li className="pwa-banner__step">
                <span className="pwa-banner__step-num">3</span>
                <span>
                  Tocá <strong>Agregar</strong> para confirmar
                </span>
              </li>
            </ol>
            <button
              onClick={handleDismiss}
              className="pwa-banner__btn pwa-banner__btn--ghost pwa-banner__btn--full"
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

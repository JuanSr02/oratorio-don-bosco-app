'use client'

import { useToastStore } from '@/lib/store'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'w-full max-w-sm flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl pointer-events-auto',
            'animate-in slide-in-from-top-3 duration-300',
            toast.type === 'success' && 'bg-success text-success-foreground',
            toast.type === 'error'   && 'bg-destructive text-destructive-foreground',
            toast.type === 'info'    && 'bg-card text-foreground border border-border'
          )}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
          {toast.type === 'error'   && <XCircle className="w-5 h-5 flex-shrink-0" />}
          {toast.type === 'info'    && <Info className="w-5 h-5 flex-shrink-0 text-primary" />}
          <p className="flex-1 text-sm font-medium leading-tight">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

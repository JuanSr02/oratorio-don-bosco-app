'use client'

import { Home, Building2, Users, Calendar, LogOut, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from './auth-provider'
import type { NavTab } from '@/lib/store'

interface BottomNavProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
}

const navItems: { id: NavTab; icon: typeof Home; label: string }[] = [
  { id: 'home',       icon: Home,              label: 'Inicio' },
  { id: 'houses',     icon: Building2,         label: 'Casas' },
  { id: 'children',   icon: Users,             label: 'Niños' },
  { id: 'attendance', icon: Calendar,          label: 'Asistencia' },
  { id: 'stats',      icon: BarChart2 as any,  label: 'Estadísticas' },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { logout } = useAuth()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-t border-border shadow-2xl pb-safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-0.5 px-2 relative transition-all duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <span className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
              <Icon className={cn('w-5 h-5 transition-transform duration-200', isActive && 'scale-110')} />
              <span className={cn('text-[10px] font-medium transition-all', isActive && 'font-semibold')}>
                {label}
              </span>
            </button>
          )
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 px-2 text-muted-foreground hover:text-destructive transition-colors duration-200"
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Salir</span>
        </button>
      </div>
    </nav>
  )
}

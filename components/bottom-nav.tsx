'use client'

import { Home, Building2, Users, Calendar, LogOut, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from './auth-provider'

export type NavTab = 'home' | 'houses' | 'children' | 'attendance' | 'stats'

interface BottomNavProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
}

const navItems: { id: NavTab; icon: typeof Home; label: string }[] = [
  { id: 'home', icon: Home, label: 'Inicio' },
  { id: 'houses', icon: Building2, label: 'Casas' },
  { id: 'children', icon: Users, label: 'Niños' },
  { id: 'attendance', icon: Calendar, label: 'Asistencia' },
  { id: 'stats', icon: BarChart2 as any, label: 'Estadísticas' },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { logout } = useAuth()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg pb-safe-bottom">
      <div className="flex items-center justify-around h-16 min-h-[64px] max-w-lg mx-auto">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full min-h-[44px] px-2 transition-colors',
              activeTab === id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[11px] mt-1 font-medium">{label}</span>
          </button>
        ))}
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center flex-1 h-full min-h-[44px] px-2 text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[11px] mt-1 font-medium">Salir</span>
        </button>
      </div>
    </nav>
  )
}

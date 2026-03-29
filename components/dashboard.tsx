'use client'

import { useState, useEffect } from 'react'
import { Heart, Home, Users, AlertTriangle, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getHouses, getChildren, hasSpecialNeeds, getNextSaturday, getAttendanceByDate } from '@/lib/db'
import type { NavTab } from './bottom-nav'
import { ThemeToggle } from './theme-toggle'

interface DashboardProps {
  onNavigate: (tab: NavTab) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    totalChildren: 0,
    totalHouses: 0,
    specialNeeds: 0,
    attendingThisSaturday: 0
  })

  const nextSaturday = getNextSaturday()
  const formattedDate = nextSaturday.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  useEffect(() => {
    async function loadData() {
      const houses = await getHouses()
      const children = await getChildren()
      const activeChildren = children.filter(c => c.isActive)
      const specialNeedsCount = activeChildren.filter(hasSpecialNeeds).length
      
      const dateKey = nextSaturday.toISOString().split('T')[0]
      const saturdayRecord = await getAttendanceByDate(dateKey)
      const attendingCount = saturdayRecord?.childrenPresent?.length || 0

      setStats({
        totalChildren: activeChildren.length,
        totalHouses: houses.length,
        specialNeeds: specialNeedsCount,
        attendingThisSaturday: attendingCount
      })
    }
    loadData()
  }, [])

  const statCards = [
    {
      title: 'Niños Activos',
      value: stats.totalChildren,
      icon: Users,
      color: 'bg-primary/10 text-primary',
      onClick: () => onNavigate('children')
    },
    {
      title: 'Casas',
      value: stats.totalHouses,
      icon: Home,
      color: 'bg-accent/50 text-accent-foreground',
      onClick: () => onNavigate('houses')
    },
    {
      title: 'Necesidades Especiales',
      value: stats.specialNeeds,
      icon: AlertTriangle,
      color: 'bg-warning/20 text-warning-foreground',
      onClick: () => onNavigate('children')
    },
    {
      title: 'Asistencia Sábado',
      value: stats.attendingThisSaturday,
      icon: Calendar,
      color: 'bg-success/20 text-success-foreground',
      onClick: () => onNavigate('attendance')
    }
  ]

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-safe-top pb-8">
        <div className="pt-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Heart className="w-5 h-5" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Oratorio Don Bosco</h1>
              <p className="text-sm opacity-90">Bienvenido</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Saturday Banner */}
      <div className="px-4 -mt-4">
        <Card className="border-0 shadow-lg bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próximo encuentro</p>
                <p className="font-semibold text-foreground capitalize">{formattedDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Resumen</h2>
        <div className="grid grid-cols-2 gap-4">
          {statCards.map((stat) => (
            <Card
              key={stat.title}
              className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={stat.onClick}
            >
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Acciones Rápidas</h2>
        <div className="space-y-3">
          <Card 
            className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onNavigate('attendance')}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Tomar Asistencia</p>
                <p className="text-sm text-muted-foreground">Registrar niños presentes este sábado</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onNavigate('children')}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/50 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Ver Niños</p>
                <p className="text-sm text-muted-foreground">Consultar información de los niños</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

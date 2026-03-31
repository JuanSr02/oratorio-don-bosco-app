'use client'

import { useState, useEffect } from 'react'
import {
  Home, Users, AlertTriangle, Calendar, ArrowRight, Sparkles
} from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { getHouses, getChildren, hasSpecialNeeds, getNextSaturday, getAttendanceByDate } from '@/lib/db'
import { useDataStore } from '@/lib/store'
import type { NavTab } from '@/lib/store'
import { ThemeToggle } from './theme-toggle'

interface DashboardProps {
  onNavigate: (tab: NavTab) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { children: cachedChildren, houses: cachedHouses, childrenLoaded, housesLoaded } = useDataStore()
  const [stats, setStats] = useState({
    totalChildren: 0,
    totalHouses: 0,
    specialNeeds: 0,
    attendingThisSaturday: 0,
  })
  const [loading, setLoading] = useState(true)

  const nextSaturday = getNextSaturday()
  const formattedDate = nextSaturday.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const houses = childrenLoaded && housesLoaded ? cachedHouses : await getHouses()
      const children = childrenLoaded ? cachedChildren : await getChildren()
      const activeChildren = children.filter((c) => c.isActive)
      const specialNeedsCount = activeChildren.filter(hasSpecialNeeds).length
      const dateKey = nextSaturday.toISOString().split('T')[0]
      const saturdayRecord = await getAttendanceByDate(dateKey)
      const attendingCount = saturdayRecord?.childrenPresent?.length || 0
      setStats({
        totalChildren: activeChildren.length,
        totalHouses: houses.length,
        specialNeeds: specialNeedsCount,
        attendingThisSaturday: attendingCount,
      })
      setLoading(false)
    }
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const statCards = [
    {
      title: 'Niños Activos',
      value: stats.totalChildren,
      icon: Users,
      bg: 'bg-primary/10',
      iconColor: 'text-primary',
      tab: 'children' as NavTab,
    },
    {
      title: 'Casas',
      value: stats.totalHouses,
      icon: Home,
      bg: 'bg-sky-100 dark:bg-sky-900/30',
      iconColor: 'text-sky-600 dark:text-sky-400',
      tab: 'houses' as NavTab,
    },
    {
      title: 'Con Alertas',
      value: stats.specialNeeds,
      icon: AlertTriangle,
      bg: 'bg-warning/15',
      iconColor: 'text-warning',
      tab: 'children' as NavTab,
    },
    {
      title: 'Asistencia',
      value: stats.attendingThisSaturday,
      icon: Calendar,
      bg: 'bg-success/15',
      iconColor: 'text-success',
      tab: 'attendance' as NavTab,
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-safe-top pb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/75" />
        <div
          className="absolute -bottom-6 -left-8 w-24 h-24 rounded-full bg-primary-foreground/5"
          aria-hidden="true"
        />
        <div className="relative pt-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-primary-foreground/20 backdrop-blur-sm shadow-inner flex-shrink-0">
              <Image
                src="/icon-512x512.png"
                alt="Don Bosco"
                width={48}
                height={48}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Oratorio Don Bosco</h1>
              <p className="text-sm opacity-80 mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Sistema de Gestión
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Saturday Banner — lifted card */}
      <div className="px-4 -mt-5">
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-warning to-success" />
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Próximo Encuentro
                </p>
                <p className="font-semibold text-foreground capitalize mt-0.5">{formattedDate}</p>
              </div>
              <button
                onClick={() => onNavigate('attendance')}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Ver <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          Resumen
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-muted/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((stat) => (
              <button
                key={stat.title}
                onClick={() => onNavigate(stat.tab)}
                className="group text-left"
              >
                <Card className="border-0 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                      <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                    <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.title}</p>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-semibold text-foreground mb-3">Acciones Rápidas</h2>
        <div className="space-y-3">
          {[
            {
              tab: 'attendance' as NavTab,
              icon: Calendar,
              bg: 'bg-primary/10',
              iconColor: 'text-primary',
              title: 'Tomar Asistencia',
              desc: 'Registrar niños presentes este sábado',
            },
            {
              tab: 'children' as NavTab,
              icon: Users,
              bg: 'bg-sky-100 dark:bg-sky-900/30',
              iconColor: 'text-sky-600 dark:text-sky-400',
              title: 'Ver Niños',
              desc: 'Consultar información de los niños',
            },
            {
              tab: 'stats' as NavTab,
              icon: AlertTriangle,
              bg: 'bg-warning/15',
              iconColor: 'text-warning',
              title: 'Estadísticas',
              desc: 'Ver reportes y tendencias de asistencia',
            },
          ].map((action) => (
            <Card
              key={action.tab}
              className="border-0 shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => onNavigate(action.tab)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center flex-shrink-0`}>
                  <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

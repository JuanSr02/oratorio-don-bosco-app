'use client'

import { useState, useEffect } from 'react'
import { BottomNav, type NavTab } from './bottom-nav'
import { Dashboard } from './dashboard'
import { HousesList } from './houses-list'
import { ChildrenList } from './children-list'
import { AttendanceScreen } from './attendance-screen'
import { StatsScreen } from './stats-screen'
import * as db from '@/lib/db'
import { syncOfflineQueue } from '@/lib/sync'

export function AppShell() {
  const [activeTab, setActiveTab] = useState<NavTab>('home')

  useEffect(() => {
    function handleOnline() { syncOfflineQueue(db) }
    
    window.addEventListener('online', handleOnline)
    handleOnline() // Sincronizamos por las dudas si entra a la app por primera vez
    
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard onNavigate={setActiveTab} />
      case 'houses':
        return <HousesList />
      case 'children':
        return <ChildrenList />
      case 'attendance':
        return <AttendanceScreen />
      case 'stats':
        return <StatsScreen />
      default:
        return <Dashboard onNavigate={setActiveTab} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {renderContent()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

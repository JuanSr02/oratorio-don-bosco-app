'use client'

import { useEffect } from 'react'
import { BottomNav } from './bottom-nav'
import { Dashboard } from './dashboard'
import { HousesList } from './houses-list'
import { ChildrenList } from './children-list'
import { AttendanceScreen } from './attendance-screen'
import { StatsScreen } from './stats-screen'
import { ToastContainer } from './toast-container'
import * as db from '@/lib/db'
import { syncOfflineQueue } from '@/lib/sync'
import { useUIStore } from '@/lib/store'

export function AppShell() {
  const { activeTab, setActiveTab } = useUIStore()

  useEffect(() => {
    function handleOnline() { syncOfflineQueue(db) }
    window.addEventListener('online', handleOnline)
    handleOnline()
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'home':      return <Dashboard onNavigate={setActiveTab} />
      case 'houses':    return <HousesList />
      case 'children':  return <ChildrenList />
      case 'attendance':return <AttendanceScreen />
      case 'stats':     return <StatsScreen />
      default:          return <Dashboard onNavigate={setActiveTab} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {renderContent()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <ToastContainer />
    </div>
  )
}

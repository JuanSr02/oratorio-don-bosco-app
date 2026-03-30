import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Child, House, AttendanceRecord } from './types'

// ── UI State ───────────────────────────────────────────────────────
export type NavTab = 'home' | 'houses' | 'children' | 'attendance' | 'stats'

interface UIState {
  activeTab: NavTab
  setActiveTab: (tab: NavTab) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))

// ── Data Cache ─────────────────────────────────────────────────────
interface DataCache {
  // Children
  children: Child[]
  childrenLoaded: boolean
  setChildren: (children: Child[]) => void
  upsertChild: (child: Child) => void

  // Houses
  houses: House[]
  housesLoaded: boolean
  setHouses: (houses: House[]) => void
  upsertHouse: (house: House) => void
  removeHouse: (id: string) => void

  // Attendance
  attendanceRecords: Record<string, AttendanceRecord>
  setAttendanceRecord: (record: AttendanceRecord) => void

  // Loading flags
  isLoadingChildren: boolean
  isLoadingHouses: boolean
  setLoadingChildren: (v: boolean) => void
  setLoadingHouses: (v: boolean) => void

  // Invalidate / reset cache
  invalidateAll: () => void
}

export const useDataStore = create<DataCache>()(
  subscribeWithSelector((set) => ({
    // Children
    children: [],
    childrenLoaded: false,
    setChildren: (children) => set({ children, childrenLoaded: true }),
    upsertChild: (child) =>
      set((state) => {
        const exists = state.children.findIndex((c) => c.id === child.id)
        if (exists >= 0) {
          const updated = [...state.children]
          updated[exists] = child
          return { children: updated }
        }
        return { children: [...state.children, child] }
      }),

    // Houses
    houses: [],
    housesLoaded: false,
    setHouses: (houses) => set({ houses, housesLoaded: true }),
    upsertHouse: (house) =>
      set((state) => {
        const exists = state.houses.findIndex((h) => h.id === house.id)
        if (exists >= 0) {
          const updated = [...state.houses]
          updated[exists] = house
          return { houses: updated }
        }
        return { houses: [...state.houses, house] }
      }),
    removeHouse: (id) =>
      set((state) => ({
        houses: state.houses.filter((h) => h.id !== id),
        children: state.children.filter((c) => c.houseId !== id),
      })),

    // Attendance
    attendanceRecords: {},
    setAttendanceRecord: (record) =>
      set((state) => ({
        attendanceRecords: {
          ...state.attendanceRecords,
          [record.date]: record,
        },
      })),

    // Loading
    isLoadingChildren: false,
    isLoadingHouses: false,
    setLoadingChildren: (v) => set({ isLoadingChildren: v }),
    setLoadingHouses: (v) => set({ isLoadingHouses: v }),

    // Reset
    invalidateAll: () =>
      set({
        children: [],
        childrenLoaded: false,
        houses: [],
        housesLoaded: false,
        attendanceRecords: {},
      }),
  }))
)

// ── Toast / Notification State ──────────────────────────────────────
type ToastType = 'success' | 'error' | 'info'
interface Toast {
  id: string
  message: string
  type: ToastType
}
interface ToastState {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3500)
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

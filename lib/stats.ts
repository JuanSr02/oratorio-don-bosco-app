import type { Child, House, AttendanceRecord } from './types'
import { calculateAge } from './db'

export interface StatsData {
  totalActive: number
  totalInactive: number
  totalHouses: number
  averageAge: number
  specialNeedsCount: number
  averageAttendanceRate: number
  attendanceHistory: { date: string; count: number; rate: number }[]
  childrenByBarrio: { barrio: string; count: number }[]
  childrenByGender: { gender: string; count: number }[]
  childrenByAgeGroup: { group: string; count: number }[]
  healthStats: { label: string; count: number }[]
  registrationTrend: { month: string; count: number }[]
}

export function computeStats(
  children: Child[],
  houses: House[],
  attendance: AttendanceRecord[]
): StatsData {
  const active = children.filter(c => c.isActive)
  const inactive = children.filter(c => !c.isActive)

  const ages = active.map(c => calculateAge(c.dateOfBirth))
  const averageAge = ages.length > 0
    ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0

  const specialNeedsCount = active.filter(c =>
    c.health.isCeliac ||
    c.health.foodAllergies.trim() !== '' ||
    c.health.medications.length > 0 ||
    c.health.otherConditions.trim() !== ''
  ).length

  const houseMap = Object.fromEntries(houses.map(h => [h.id, h]))

  const attendanceHistory = attendance.map(r => ({
    date: r.date,
    count: r.childrenPresent.length,
    rate: active.length > 0
      ? Math.round((r.childrenPresent.length / active.length) * 100) : 0
  }))

  const averageAttendanceRate = attendanceHistory.length > 0
    ? Math.round(attendanceHistory.reduce((a, r) => a + r.rate, 0) / attendanceHistory.length) : 0

  const barrioMap: Record<string, number> = {}
  active.forEach(c => {
    const barrio = houseMap[c.houseId]?.address.barrio || 'Sin barrio'
    barrioMap[barrio] = (barrioMap[barrio] || 0) + 1
  })
  const childrenByBarrio = Object.entries(barrioMap)
    .map(([barrio, count]) => ({ barrio, count }))
    .sort((a, b) => b.count - a.count)

  const genderMap: Record<string, number> = {}
  active.forEach(c => { genderMap[c.gender] = (genderMap[c.gender] || 0) + 1 })
  const childrenByGender = Object.entries(genderMap)
    .map(([gender, count]) => ({ gender, count }))

  const ageGroups = [
    { label: '3-5 años', min: 3, max: 5 },
    { label: '6-8 años', min: 6, max: 8 },
    { label: '9-11 años', min: 9, max: 11 },
    { label: '12-14 años', min: 12, max: 14 },
    { label: '15+ años', min: 15, max: 99 },
  ]
  const childrenByAgeGroup = ageGroups.map(g => ({
    group: g.label,
    count: active.filter(c => {
      const age = calculateAge(c.dateOfBirth)
      return age >= g.min && age <= g.max
    }).length
  }))

  const healthStats = [
    { label: 'Celíacos',  count: active.filter(c => c.health.isCeliac).length },
    { label: 'Alergias',  count: active.filter(c => c.health.foodAllergies.trim() !== '').length },
    { label: 'Medicación',count: active.filter(c => c.health.medications.length > 0).length },
    { label: 'Otras',     count: active.filter(c => c.health.otherConditions.trim() !== '').length },
  ]

  const monthMap: Record<string, number> = {}
  children.forEach(c => {
    const month = c.createdAt.slice(0, 7)
    monthMap[month] = (monthMap[month] || 0) + 1
  })
  const registrationTrend = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }))

  return {
    totalActive: active.length,
    totalInactive: inactive.length,
    totalHouses: houses.length,
    averageAge,
    specialNeedsCount,
    averageAttendanceRate,
    attendanceHistory,
    childrenByBarrio,
    childrenByGender,
    childrenByAgeGroup,
    healthStats,
    registrationTrend,
  }
}

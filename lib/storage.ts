'use client'

import type { House, Child, AttendanceRecord } from './types'

const STORAGE_KEYS = {
  HOUSES: 'oratorio_houses',
  CHILDREN: 'oratorio_children',
  ATTENDANCE: 'oratorio_attendance',
  AUTH: 'oratorio_auth',
  INITIALIZED: 'oratorio_initialized'
}

// Auth
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true'
}

export function login(username: string, password: string): boolean {
  if (username === 'oratorio' && password === 'salesianodonbosco2026') {
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true')
    return true
  }
  return false
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.AUTH)
}

// Houses
export function getHouses(): House[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.HOUSES)
  return data ? JSON.parse(data) : []
}

export function saveHouse(house: House): void {
  const houses = getHouses()
  const existingIndex = houses.findIndex(h => h.id === house.id)
  if (existingIndex >= 0) {
    houses[existingIndex] = house
  } else {
    houses.push(house)
  }
  localStorage.setItem(STORAGE_KEYS.HOUSES, JSON.stringify(houses))
}

export function deleteHouse(id: string): void {
  const houses = getHouses().filter(h => h.id !== id)
  localStorage.setItem(STORAGE_KEYS.HOUSES, JSON.stringify(houses))
  // Also delete children associated with this house
  const children = getChildren().filter(c => c.houseId !== id)
  localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children))
}

export function getHouseById(id: string): House | undefined {
  return getHouses().find(h => h.id === id)
}

// Children
export function getChildren(): Child[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.CHILDREN)
  return data ? JSON.parse(data) : []
}

export function saveChild(child: Child): void {
  const children = getChildren()
  const existingIndex = children.findIndex(c => c.id === child.id)
  if (existingIndex >= 0) {
    children[existingIndex] = child
  } else {
    children.push(child)
  }
  localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children))
}

export function deleteChild(id: string): void {
  const children = getChildren().filter(c => c.id !== id)
  localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children))
}

export function getChildById(id: string): Child | undefined {
  return getChildren().find(c => c.id === id)
}

export function getChildrenByHouse(houseId: string): Child[] {
  return getChildren().filter(c => c.houseId === houseId)
}

// Attendance
export function getAttendanceRecords(): AttendanceRecord[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE)
  return data ? JSON.parse(data) : []
}

export function saveAttendance(record: AttendanceRecord): void {
  const records = getAttendanceRecords()
  const existingIndex = records.findIndex(r => r.date === record.date)
  if (existingIndex >= 0) {
    records[existingIndex] = record
  } else {
    records.push(record)
  }
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records))
}

export function getAttendanceByDate(date: string): AttendanceRecord | undefined {
  return getAttendanceRecords().find(r => r.date === date)
}

// Utility functions
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function getNextSaturday(): Date {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7
  const nextSaturday = new Date(today)
  nextSaturday.setDate(today.getDate() + (dayOfWeek === 6 ? 0 : daysUntilSaturday))
  nextSaturday.setHours(0, 0, 0, 0)
  return nextSaturday
}

export function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export function hasSpecialNeeds(child: Child): boolean {
  return (
    child.health.isCeliac ||
    child.health.foodAllergies.trim() !== '' ||
    child.health.medications.length > 0 ||
    child.health.otherConditions.trim() !== ''
  )
}

// Seed data
export function initializeSeedData(): void {
  if (typeof window === 'undefined') return
  
  if (localStorage.getItem(STORAGE_KEYS.INITIALIZED)) return

  const houses: House[] = [
    {
      id: 'house1',
      address: { street: 'Av. San Martín', number: '1245', barrio: 'Villa Esperanza' },
      reference: 'Casa celeste con portón negro, al lado de la despensa',
      gpsNote: 'Frente a la plaza del barrio',
      createdAt: new Date().toISOString()
    },
    {
      id: 'house2',
      address: { street: 'Calle Los Pinos', number: '567', barrio: 'Barrio Norte' },
      reference: 'Casa de ladrillos con reja verde',
      gpsNote: 'A dos cuadras de la escuela primaria',
      createdAt: new Date().toISOString()
    },
    {
      id: 'house3',
      address: { street: 'Pasaje del Sol', number: '89', barrio: 'Villa Esperanza' },
      reference: 'Última casa del pasaje, portón marrón',
      gpsNote: 'Al final del pasaje, cerca del arroyo',
      createdAt: new Date().toISOString()
    }
  ]

  const children: Child[] = [
    {
      id: 'child1',
      houseId: 'house1',
      firstName: 'Sofía',
      lastName: 'González',
      dateOfBirth: '2016-03-15',
      gender: 'femenino',
      isActive: true,
      health: {
        isCeliac: true,
        foodAllergies: '',
        medications: [],
        otherConditions: ''
      },
      primaryGuardian: { name: 'María González', relationship: 'mamá', phone: '+54 11 2345-6789' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'child2',
      houseId: 'house1',
      firstName: 'Mateo',
      lastName: 'González',
      dateOfBirth: '2018-07-22',
      gender: 'masculino',
      isActive: true,
      health: {
        isCeliac: false,
        foodAllergies: '',
        medications: [],
        otherConditions: ''
      },
      primaryGuardian: { name: 'María González', relationship: 'mamá', phone: '+54 11 2345-6789' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'child3',
      houseId: 'house2',
      firstName: 'Valentina',
      lastName: 'Rodríguez',
      dateOfBirth: '2015-11-08',
      gender: 'femenino',
      isActive: true,
      health: {
        isCeliac: false,
        foodAllergies: 'Maní, nueces',
        medications: [
          { name: 'Salbutamol', dose: '2 puffs', frequency: 'Cuando tiene crisis de asma' }
        ],
        otherConditions: 'Asma leve'
      },
      primaryGuardian: { name: 'Carlos Rodríguez', relationship: 'papá', phone: '+54 11 3456-7890' },
      secondaryGuardian: { name: 'Ana Rodríguez', relationship: 'abuela', phone: '+54 11 4567-8901' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'child4',
      houseId: 'house2',
      firstName: 'Tomás',
      lastName: 'Rodríguez',
      dateOfBirth: '2017-05-30',
      gender: 'masculino',
      isActive: true,
      health: {
        isCeliac: false,
        foodAllergies: '',
        medications: [],
        otherConditions: ''
      },
      primaryGuardian: { name: 'Carlos Rodríguez', relationship: 'papá', phone: '+54 11 3456-7890' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'child5',
      houseId: 'house3',
      firstName: 'Camila',
      lastName: 'Fernández',
      dateOfBirth: '2014-09-12',
      gender: 'femenino',
      isActive: true,
      health: {
        isCeliac: false,
        foodAllergies: '',
        medications: [],
        otherConditions: ''
      },
      primaryGuardian: { name: 'Laura Fernández', relationship: 'mamá', phone: '+54 11 5678-9012' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'child6',
      houseId: 'house3',
      firstName: 'Lucas',
      lastName: 'Fernández',
      dateOfBirth: '2019-01-25',
      gender: 'masculino',
      isActive: false,
      health: {
        isCeliac: false,
        foodAllergies: '',
        medications: [],
        otherConditions: ''
      },
      primaryGuardian: { name: 'Laura Fernández', relationship: 'mamá', phone: '+54 11 5678-9012' },
      createdAt: new Date().toISOString()
    }
  ]

  localStorage.setItem(STORAGE_KEYS.HOUSES, JSON.stringify(houses))
  localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children))
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true')
}

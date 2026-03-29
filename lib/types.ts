export interface House {
  id: string
  address: {
    street: string
    number: string
    barrio: string
  }
  reference: string
  gpsNote: string
  createdAt: string
}

export interface Medication {
  name: string
  dose: string
  frequency: string
}

export interface Guardian {
  name: string
  relationship: string
  phone: string
}

export interface Child {
  id: string
  houseId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'masculino' | 'femenino' | 'otro'
  photo?: string
  isActive: boolean
  health: {
    isCeliac: boolean
    foodAllergies: string
    medications: Medication[]
    otherConditions: string
  }
  primaryGuardian: Guardian
  secondaryGuardian?: Guardian
  createdAt: string
}

export interface AttendanceRecord {
  id: string
  date: string // ISO date string (Saturday)
  childrenPresent: string[] // Array of child IDs
  createdAt: string
}

export type RelationshipType = 
  | 'mamá' 
  | 'papá' 
  | 'abuela' 
  | 'abuelo' 
  | 'tío' 
  | 'tía' 
  | 'hermano' 
  | 'hermana' 
  | 'otro'

export const RELATIONSHIP_OPTIONS: RelationshipType[] = [
  'mamá',
  'papá',
  'abuela',
  'abuelo',
  'tío',
  'tía',
  'hermano',
  'hermana',
  'otro'
]

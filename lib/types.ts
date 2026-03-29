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

// ── Tipos de filas de base de datos (Supabase) ─────────────────
export interface MedicationRow {
  child_id: string
  name: string
  dose: string
  frequency: string
}

export interface HouseRow {
  id: string
  street: string
  number: string
  barrio: string
  reference: string | null
  gps_note: string | null
  created_at: string
}

export interface ChildRow {
  id: string
  house_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: 'masculino' | 'femenino' | 'otro'
  photo: string | null
  is_active: boolean
  is_celiac: boolean
  food_allergies: string | null
  other_conditions: string | null
  primary_guardian_name: string
  primary_guardian_rel: string
  primary_guardian_phone: string
  secondary_guardian_name: string | null
  secondary_guardian_rel: string | null
  secondary_guardian_phone: string | null
  created_at: string
  medications: MedicationRow[]
}

export interface AttendanceRecordRow {
  id: string
  date: string
  created_at: string
  attendance_children: { child_id: string }[]
}

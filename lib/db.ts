import { supabase } from './supabase'
import type { House, Child, AttendanceRecord, HouseRow, ChildRow, MedicationRow, RelationshipType } from './types'
import { queueOfflineOperation, setLocalCache, getLocalCache, updateLocalCacheArray } from './sync'

// ── AUTENTICACIÓN ──────────────────────────────────────────────
export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { user: data.user, error }
}

export async function logout() {
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  if (typeof window !== 'undefined' && !navigator.onLine) return { id: 'offline-user' }
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

// ── CASAS ──────────────────────────────────────────────────────
export async function getHouses(): Promise<House[]> {
  try {
    if (typeof window !== 'undefined' && !navigator.onLine) throw new TypeError('Failed to fetch')
    const { data, error } = await supabase.from('houses').select('*').order('created_at', { ascending: true })
    if (error) throw error
    const rows = data.map(mapHouseFromDB)
    setLocalCache('houses', rows)
    return rows
  } catch (err: any) {
    if (err?.message === 'Failed to fetch' || !navigator.onLine) {
      return getLocalCache('houses', [])
    }
    console.error('Error fetching houses:', err)
    return []
  }
}

export async function supabaseSaveHouse(house: House): Promise<void> {
  const { error } = await supabase.from('houses').upsert({
    id: house.id, street: house.address.street, number: house.address.number,
    barrio: house.address.barrio, reference: house.reference, gps_note: house.gpsNote,
  })
  if (error) throw error
}

export async function saveHouse(house: House): Promise<void> {
  try {
    if (typeof window !== 'undefined' && !navigator.onLine) throw new TypeError('Failed to fetch')
    await supabaseSaveHouse(house)
  } catch (err: any) {
    if (err?.message === 'Failed to fetch' || !navigator.onLine) {
      queueOfflineOperation('SAVE_HOUSE', house)
    } else throw err
  }
  updateLocalCacheArray('houses', house, false)
}

export async function supabaseDeleteHouse(id: string): Promise<void> {
  const { error } = await supabase.from('houses').delete().eq('id', id)
  if (error) throw error
}

export async function deleteHouse(id: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && !navigator.onLine) throw new TypeError('Failed to fetch')
    await supabaseDeleteHouse(id)
  } catch (err: any) {
    if (err?.message === 'Failed to fetch' || !navigator.onLine) queueOfflineOperation('DELETE_HOUSE', id)
    else throw err
  }
  updateLocalCacheArray('houses', id, true)
}

// ── NIÑOS ──────────────────────────────────────────────────────
export async function getChildren(): Promise<Child[]> {
  try {
    if (typeof window !== 'undefined' && !navigator.onLine) throw new TypeError('Failed to fetch')
    const { data, error } = await supabase.from('children').select('*, medications(*)').order('first_name', { ascending: true })
    if (error) throw error
    const rows = data.map(mapChildFromDB)
    setLocalCache('children', rows)
    return rows
  } catch (err: any) {
    if (err?.message === 'Failed to fetch' || !navigator.onLine) {
      return getLocalCache('children', [])
    }
    console.error('Error fetching children:', err)
    return []
  }
}

export async function supabaseSaveChild(child: Child): Promise<void> {
  const { error } = await supabase.from('children').upsert({
    id: child.id, house_id: child.houseId, first_name: child.firstName, last_name: child.lastName,
    date_of_birth: child.dateOfBirth, gender: child.gender, photo: child.photo,
    is_active: child.isActive, is_celiac: child.health.isCeliac, food_allergies: child.health.foodAllergies,
    other_conditions: child.health.otherConditions, primary_guardian_name: child.primaryGuardian.name,
    primary_guardian_rel: child.primaryGuardian.relationship, primary_guardian_phone: child.primaryGuardian.phone,
    secondary_guardian_name: child.secondaryGuardian?.name || null,
    secondary_guardian_rel: child.secondaryGuardian?.relationship || null,
    secondary_guardian_phone: child.secondaryGuardian?.phone || null,
  })
  if (error) throw error

  await supabase.from('medications').delete().eq('child_id', child.id)
  if (child.health.medications.length > 0) {
    await supabase.from('medications').insert(
      child.health.medications.map(m => ({ child_id: child.id, name: m.name, dose: m.dose, frequency: m.frequency }))
    )
  }
}

export async function saveChild(child: Child): Promise<void> {
  try {
    if (typeof window !== 'undefined' && !navigator.onLine) throw new TypeError('Failed to fetch')
    await supabaseSaveChild(child)
  } catch (err: any) {
    if (err?.message === 'Failed to fetch' || !navigator.onLine) queueOfflineOperation('SAVE_CHILD', child)
    else throw err
  }
  updateLocalCacheArray('children', child, false)
}

export async function supabaseDeleteChild(id: string): Promise<void> {
  const { error } = await supabase.from('children').delete().eq('id', id)
  if (error) throw error
}

export async function deleteChild(id: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && !navigator.onLine) throw new TypeError('Failed to fetch')
    await supabaseDeleteChild(id)
  } catch (err: any) {
    if (err?.message === 'Failed to fetch' || !navigator.onLine) queueOfflineOperation('DELETE_CHILD', id)
    else throw err
  }
  updateLocalCacheArray('children', id, true)
}

export async function getChildById(id: string): Promise<Child | undefined> {
  try {
    if (typeof window !== 'undefined' && !navigator.onLine) throw new TypeError('Failed to fetch')
    const { data, error } = await supabase
      .from('children')
      .select('*, medications(*)')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    if (!data) return undefined
    return mapChildFromDB(data)
  } catch (err: any) {
    if (err?.message === 'Failed to fetch' || !navigator.onLine) {
      const cached: Child[] = getLocalCache('children', [])
      return cached.find(c => c.id === id)
    }
    console.error('Error fetching child by id:', err)
    return undefined
  }
}

export async function getChildrenByHouse(houseId: string): Promise<Child[]> {
  try {
    if (typeof window !== 'undefined' && !navigator.onLine) throw new TypeError('Failed to fetch')
    const { data, error } = await supabase
      .from('children')
      .select('*, medications(*)')
      .eq('house_id', houseId)
      .order('first_name', { ascending: true })
    if (error) throw error
    return data.map(mapChildFromDB)
  } catch (err: any) {
    if (err?.message === 'Failed to fetch' || !navigator.onLine) {
      const cached: Child[] = getLocalCache('children', [])
      return cached.filter(c => c.houseId === houseId)
    }
    console.error('Error fetching children by house:', err)
    return []
  }
}

// ── ASISTENCIA ────────────────────────────────────────────────
export async function getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    if (typeof window !== 'undefined' && !navigator.onLine) throw new TypeError('Failed to fetch')
    const { data, error } = await supabase.from('attendance_records').select('*, attendance_children(child_id)').order('date', { ascending: true })
    if (error) throw error
    const rows = data.map((r: any) => ({
      id: r.id, date: r.date,
      childrenPresent: r.attendance_children.map((ac: any) => ac.child_id),
      createdAt: r.created_at,
    }))
    setLocalCache('attendance', rows)
    return rows
  } catch (err: any) {
    if (err?.message === 'Failed to fetch' || !navigator.onLine) {
      return getLocalCache('attendance', [])
    }
    console.error('Error fetching all attendance:', err)
    return []
  }
}

export async function getAttendanceByDate(date: string): Promise<AttendanceRecord | undefined> {
  try {
    if (typeof window !== 'undefined' && !navigator.onLine) throw new TypeError('Failed to fetch')
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*, attendance_children(child_id)')
      .eq('date', date)
      .maybeSingle()
    if (error) throw error
    if (!data) return undefined
    return {
      id: data.id, date: data.date,
      childrenPresent: (data.attendance_children as any[]).map((ac) => ac.child_id),
      createdAt: data.created_at,
    }
  } catch (err: any) {
    if (err?.message === 'Failed to fetch' || !navigator.onLine) {
      const cached: AttendanceRecord[] = getLocalCache('attendance', [])
      return cached.find(r => r.date === date)
    }
    console.error('Error fetching attendance by date:', err)
    return undefined
  }
}

export async function supabaseSaveAttendance(record: AttendanceRecord): Promise<void> {
  const { error: recordError } = await supabase.from('attendance_records').upsert({ id: record.id, date: record.date })
  if (recordError) throw recordError

  await supabase.from('attendance_children').delete().eq('attendance_id', record.id)
  if (record.childrenPresent.length > 0) {
    const { error: childrenError } = await supabase.from('attendance_children').insert(
      record.childrenPresent.map(childId => ({ attendance_id: record.id, child_id: childId }))
    )
    if (childrenError) throw childrenError
  }
}

export async function saveAttendance(record: AttendanceRecord): Promise<void> {
  try {
    if (typeof window !== 'undefined' && !navigator.onLine) throw new TypeError('Failed to fetch')
    await supabaseSaveAttendance(record)
  } catch (err: any) {
    if (err?.message === 'Failed to fetch' || !navigator.onLine) queueOfflineOperation('SAVE_ATTENDANCE', record)
    else throw err
  }
  updateLocalCacheArray('attendance', record, false)
}

// ── UTILS ───────────────────────────────────────────────────
export function generateId(): string {
  return crypto.randomUUID()
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
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--
  return age
}

export function hasSpecialNeeds(child: Child): boolean {
  return (child.health.isCeliac || child.health.foodAllergies.trim() !== '' ||
    child.health.medications.length > 0 || child.health.otherConditions.trim() !== '')
}

// ── MAPPERS ───────────────────────────────────────────────────
function mapHouseFromDB(row: HouseRow): House {
  return {
    id: row.id,
    address: { street: row.street, number: row.number, barrio: row.barrio },
    reference: row.reference || '',
    gpsNote: row.gps_note || '',
    createdAt: row.created_at,
  }
}

function mapChildFromDB(row: ChildRow): Child {
  return {
    id: row.id, houseId: row.house_id, firstName: row.first_name, lastName: row.last_name,
    dateOfBirth: row.date_of_birth, gender: row.gender, photo: row.photo || undefined,
    isActive: row.is_active,
    health: {
      isCeliac: row.is_celiac || false, foodAllergies: row.food_allergies || '',
      medications: (row.medications || []).map((m: MedicationRow) => ({ name: m.name, dose: m.dose, frequency: m.frequency })),
      otherConditions: row.other_conditions || '',
    },
    primaryGuardian: { name: row.primary_guardian_name, relationship: row.primary_guardian_rel as RelationshipType, phone: row.primary_guardian_phone },
    secondaryGuardian: row.secondary_guardian_name ? { name: row.secondary_guardian_name, relationship: row.secondary_guardian_rel as RelationshipType, phone: row.secondary_guardian_phone || '' } : undefined,
    createdAt: row.created_at,
  }
}

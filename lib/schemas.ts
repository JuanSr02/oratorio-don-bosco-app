import { z } from 'zod'

// ── Login ──────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresá un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})
export type LoginFormData = z.infer<typeof loginSchema>

// ── Medication ─────────────────────────────────────────────────────
export const medicationSchema = z.object({
  name: z.string().min(1, 'El nombre del medicamento es requerido'),
  dose: z.string().min(1, 'La dosis es requerida'),
  frequency: z.string().min(1, 'La frecuencia es requerida'),
})
export type MedicationFormData = z.infer<typeof medicationSchema>

// ── Guardian ───────────────────────────────────────────────────────
const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/

const guardianBaseSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  relationship: z.string().min(1, 'La relación es requerida'),
  phone: z
    .string()
    .min(1, 'El teléfono es requerido')
    .regex(phoneRegex, 'Ingresá un número de teléfono válido'),
})

// ── Child ──────────────────────────────────────────────────────────
export const childSchema = z.object({
  houseId: z.string().min(1, 'Seleccioná una casa'),
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre es demasiado largo'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido es demasiado largo'),
  dateOfBirth: z
    .string()
    .min(1, 'La fecha de nacimiento es requerida')
    .refine((val) => {
      const date = new Date(val)
      const now = new Date()
      const minDate = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate())
      const maxDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      return date >= minDate && date <= maxDate
    }, 'La edad debe estar entre 1 y 18 años'),
  gender: z.enum(['masculino', 'femenino', 'otro'], {
    errorMap: () => ({ message: 'Seleccioná un género' }),
  }),
  isActive: z.boolean(),
  isCeliac: z.boolean(),
  foodAllergies: z.string().max(200, 'Demasiado largo').optional().default(''),
  medications: z.array(medicationSchema).optional().default([]),
  otherConditions: z.string().max(500, 'Demasiado largo').optional().default(''),
  primaryGuardianName: z
    .string()
    .min(2, 'El nombre del tutor debe tener al menos 2 caracteres'),
  primaryGuardianRelationship: z.string().min(1, 'La relación es requerida'),
  primaryGuardianPhone: z
    .string()
    .min(1, 'El teléfono es requerido')
    .regex(phoneRegex, 'Ingresá un número de teléfono válido'),
  secondaryGuardianName: z.string().optional().default(''),
  secondaryGuardianRelationship: z.string().optional().default(''),
  secondaryGuardianPhone: z.string().optional().default(''),
}).refine(
  (data) => {
    if (data.secondaryGuardianName && data.secondaryGuardianName.length > 0) {
      return (
        data.secondaryGuardianRelationship &&
        data.secondaryGuardianRelationship.length > 0 &&
        data.secondaryGuardianPhone &&
        phoneRegex.test(data.secondaryGuardianPhone)
      )
    }
    return true
  },
  {
    message: 'Si ingresás un contacto secundario, completá todos sus datos',
    path: ['secondaryGuardianPhone'],
  }
)
export type ChildFormData = z.infer<typeof childSchema>

// ── House ──────────────────────────────────────────────────────────
export const houseSchema = z.object({
  street: z
    .string()
    .min(2, 'La calle debe tener al menos 2 caracteres')
    .max(100, 'Demasiado largo'),
  number: z
    .string()
    .min(1, 'El número es requerido')
    .max(10, 'Demasiado largo'),
  barrio: z
    .string()
    .min(2, 'El barrio debe tener al menos 2 caracteres')
    .max(60, 'Demasiado largo'),
  reference: z.string().max(300, 'Demasiado largo').optional().default(''),
  gpsNote: z.string().max(300, 'Demasiado largo').optional().default(''),
})
export type HouseFormData = z.infer<typeof houseSchema>

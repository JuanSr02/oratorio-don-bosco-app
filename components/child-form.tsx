'use client'

import { useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft, User, Heart, Phone, Plus, Trash2,
  AlertCircle, CheckCircle2, ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { saveChild, generateId } from '@/lib/db'
import { useDataStore, useToastStore } from '@/lib/store'
import { childSchema, type ChildFormData } from '@/lib/schemas'
import type { Child, House } from '@/lib/types'
import { RELATIONSHIP_OPTIONS } from '@/lib/types'

interface ChildFormProps {
  child?: Child
  houses: House[]
  onClose: () => void
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1 text-xs text-destructive mt-1 animate-in slide-in-from-top-1">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      {message}
    </p>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  color = 'text-primary',
  bgColor = 'bg-primary/10',
}: {
  icon: React.ElementType
  title: string
  subtitle?: string
  color?: string
  bgColor?: string
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-9 h-9 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <h2 className="font-semibold text-foreground leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

export function ChildForm({ child, houses, onClose }: ChildFormProps) {
  const { upsertChild } = useDataStore()
  const { addToast } = useToastStore()
  const isEditing = !!child

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChildFormData>({
    resolver: zodResolver(childSchema),
    mode: 'onBlur',
    defaultValues: {
      houseId: child?.houseId ?? '',
      firstName: child?.firstName ?? '',
      lastName: child?.lastName ?? '',
      dateOfBirth: child?.dateOfBirth ?? '',
      gender: child?.gender ?? 'masculino',
      isActive: child?.isActive ?? true,
      isCeliac: child?.health.isCeliac ?? false,
      foodAllergies: child?.health.foodAllergies ?? '',
      medications: child?.health.medications ?? [],
      otherConditions: child?.health.otherConditions ?? '',
      primaryGuardianName: child?.primaryGuardian.name ?? '',
      primaryGuardianRelationship: child?.primaryGuardian.relationship ?? 'mamá',
      primaryGuardianPhone: child?.primaryGuardian.phone ?? '',
      secondaryGuardianName: child?.secondaryGuardian?.name ?? '',
      secondaryGuardianRelationship: child?.secondaryGuardian?.relationship ?? '',
      secondaryGuardianPhone: child?.secondaryGuardian?.phone ?? '',
    },
  })

  const { fields: medFields, append: appendMed, remove: removeMed } = useFieldArray({
    control,
    name: 'medications',
  })

  const secondaryGuardianName = watch('secondaryGuardianName')

  const onSubmit = async (data: ChildFormData) => {
    const childData: Child = {
      id: child?.id ?? generateId(),
      houseId: data.houseId,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      isActive: data.isActive,
      health: {
        isCeliac: data.isCeliac,
        foodAllergies: data.foodAllergies ?? '',
        medications: (data.medications ?? []).filter((m) => m.name.trim() !== ''),
        otherConditions: data.otherConditions ?? '',
      },
      primaryGuardian: {
        name: data.primaryGuardianName,
        relationship: data.primaryGuardianRelationship,
        phone: data.primaryGuardianPhone,
      },
      secondaryGuardian:
        data.secondaryGuardianName
          ? {
              name: data.secondaryGuardianName,
              relationship: data.secondaryGuardianRelationship ?? '',
              phone: data.secondaryGuardianPhone ?? '',
            }
          : undefined,
      createdAt: child?.createdAt ?? new Date().toISOString(),
    }

    await saveChild(childData)
    upsertChild(childData)
    addToast(
      isEditing ? 'Niño actualizado correctamente' : 'Niño registrado correctamente',
      'success'
    )
    onClose()
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-safe-top pb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="relative pt-8 flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-primary-foreground/10 transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{isEditing ? 'Editar Niño' : 'Nuevo Niño'}</h1>
            <p className="text-sm opacity-75 mt-0.5">
              {isEditing ? 'Modificá los datos del niño' : 'Registrá un nuevo niño en el sistema'}
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-4 py-6 space-y-4">

        {/* ── Información básica ───────────────────────────────── */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-5 space-y-4">
            <SectionHeader icon={User} title="Información Básica" subtitle="Datos de identificación del niño" />

            {/* Casa */}
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">
                Casa <span className="text-destructive">*</span>
              </label>
              <Controller
                control={control}
                name="houseId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={`h-12 ${errors.houseId ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="Seleccionar casa" />
                    </SelectTrigger>
                    <SelectContent>
                      {houses.map((house) => (
                        <SelectItem key={house.id} value={house.id}>
                          {house.address.street} {house.address.number} · {house.address.barrio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.houseId?.message} />
            </div>

            {/* Nombre / Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="text-sm font-medium text-foreground/80 mb-1.5 block">
                  Nombre <span className="text-destructive">*</span>
                </label>
                <Input
                  id="firstName"
                  placeholder="Nombre"
                  {...register('firstName')}
                  className={`h-12 text-base ${errors.firstName ? 'border-destructive' : ''}`}
                />
                <FieldError message={errors.firstName?.message} />
              </div>
              <div>
                <label htmlFor="lastName" className="text-sm font-medium text-foreground/80 mb-1.5 block">
                  Apellido <span className="text-destructive">*</span>
                </label>
                <Input
                  id="lastName"
                  placeholder="Apellido"
                  {...register('lastName')}
                  className={`h-12 text-base ${errors.lastName ? 'border-destructive' : ''}`}
                />
                <FieldError message={errors.lastName?.message} />
              </div>
            </div>

            {/* Fecha / Género */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dateOfBirth" className="text-sm font-medium text-foreground/80 mb-1.5 block">
                  Fecha de Nacimiento <span className="text-destructive">*</span>
                </label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth')}
                  className={`h-12 text-base ${errors.dateOfBirth ? 'border-destructive' : ''}`}
                />
                <FieldError message={errors.dateOfBirth?.message} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-1.5 block">
                  Género <span className="text-destructive">*</span>
                </label>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`h-12 ${errors.gender ? 'border-destructive' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Estado activo */}
            <div className="flex items-center justify-between bg-muted/40 rounded-xl p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Estado Activo</p>
                <p className="text-xs text-muted-foreground">Indicá si el niño asiste actualmente</p>
              </div>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Salud ────────────────────────────────────────────── */}
        <Card className="border-0 shadow-md bg-warning/5 border-l-4 border-l-warning/50">
          <CardContent className="p-5 space-y-4">
            <SectionHeader
              icon={Heart}
              title="Salud y Necesidades Especiales"
              subtitle="Información médica importante"
              color="text-warning"
              bgColor="bg-warning/15"
            />

            {/* Celíaco */}
            <div className="flex items-center justify-between bg-warning/10 rounded-xl p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Celíaco / Sin TACC</p>
                <p className="text-xs text-muted-foreground">Requiere alimentación libre de gluten</p>
              </div>
              <Controller
                control={control}
                name="isCeliac"
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>

            {/* Alergias */}
            <div>
              <label htmlFor="foodAllergies" className="text-sm font-medium text-foreground/80 mb-1.5 block">
                Alergias Alimentarias
              </label>
              <Input
                id="foodAllergies"
                placeholder="Ej: Maní, nueces, mariscos"
                {...register('foodAllergies')}
                className="h-12 text-base"
              />
              <FieldError message={errors.foodAllergies?.message} />
            </div>

            {/* Medicamentos */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Medicamentos</p>
                  <p className="text-xs text-muted-foreground">{medFields.length} registrado{medFields.length !== 1 ? 's' : ''}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendMed({ name: '', dose: '', frequency: '' })}
                  className="gap-1 h-9 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar
                </Button>
              </div>

              <div className="space-y-3">
                {medFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-card rounded-xl p-4 space-y-3 border border-border/60 shadow-sm animate-in slide-in-from-top-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Medicamento {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMed(index)}
                        className="text-destructive hover:text-destructive/80 transition-colors p-1 rounded-lg hover:bg-destructive/10"
                        aria-label="Eliminar medicamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Input
                      placeholder="Nombre del medicamento"
                      {...register(`medications.${index}.name`)}
                      className={`text-sm ${errors.medications?.[index]?.name ? 'border-destructive' : ''}`}
                    />
                    <FieldError message={errors.medications?.[index]?.name?.message} />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          placeholder="Dosis"
                          {...register(`medications.${index}.dose`)}
                          className={`text-sm ${errors.medications?.[index]?.dose ? 'border-destructive' : ''}`}
                        />
                        <FieldError message={errors.medications?.[index]?.dose?.message} />
                      </div>
                      <div>
                        <Input
                          placeholder="Frecuencia"
                          {...register(`medications.${index}.frequency`)}
                          className={`text-sm ${errors.medications?.[index]?.frequency ? 'border-destructive' : ''}`}
                        />
                        <FieldError message={errors.medications?.[index]?.frequency?.message} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Otras condiciones */}
            <div>
              <label htmlFor="otherConditions" className="text-sm font-medium text-foreground/80 mb-1.5 block">
                Otras Condiciones
              </label>
              <Textarea
                id="otherConditions"
                placeholder="Ej: Asma, diabetes, condiciones de movilidad, etc."
                {...register('otherConditions')}
                rows={2}
                className={errors.otherConditions ? 'border-destructive' : ''}
              />
              <FieldError message={errors.otherConditions?.message} />
            </div>
          </CardContent>
        </Card>

        {/* ── Contacto Principal ───────────────────────────────── */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-5 space-y-4">
            <SectionHeader icon={Phone} title="Contacto Principal" subtitle="Tutor responsable del niño" />

            <div>
              <label htmlFor="primaryGuardianName" className="text-sm font-medium text-foreground/80 mb-1.5 block">
                Nombre del Tutor <span className="text-destructive">*</span>
              </label>
              <Input
                id="primaryGuardianName"
                placeholder="Nombre completo"
                {...register('primaryGuardianName')}
                className={`h-12 text-base ${errors.primaryGuardianName ? 'border-destructive' : ''}`}
              />
              <FieldError message={errors.primaryGuardianName?.message} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-1.5 block">
                  Relación <span className="text-destructive">*</span>
                </label>
                <Controller
                  control={control}
                  name="primaryGuardianRelationship"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`h-12 ${errors.primaryGuardianRelationship ? 'border-destructive' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_OPTIONS.map((rel) => (
                          <SelectItem key={rel} value={rel} className="capitalize">
                            {rel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <label htmlFor="primaryGuardianPhone" className="text-sm font-medium text-foreground/80 mb-1.5 block">
                  Teléfono <span className="text-destructive">*</span>
                </label>
                <Input
                  id="primaryGuardianPhone"
                  type="tel"
                  placeholder="+54 11 1234-5678"
                  {...register('primaryGuardianPhone')}
                  className={`h-12 text-base ${errors.primaryGuardianPhone ? 'border-destructive' : ''}`}
                />
                <FieldError message={errors.primaryGuardianPhone?.message} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Contacto Secundario ──────────────────────────────── */}
        <Card className="border-0 shadow-md border-dashed">
          <CardContent className="p-5 space-y-4">
            <SectionHeader
              icon={Phone}
              title="Contacto Secundario"
              subtitle="Opcional · Solo si hay otro tutor"
              color="text-muted-foreground"
              bgColor="bg-muted/50"
            />

            <div>
              <label htmlFor="secondaryGuardianName" className="text-sm font-medium text-foreground/80 mb-1.5 block">
                Nombre del Tutor
              </label>
              <Input
                id="secondaryGuardianName"
                placeholder="Nombre completo"
                {...register('secondaryGuardianName')}
                className="h-12 text-base"
              />
            </div>

            {secondaryGuardianName && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Relación</label>
                  <Controller
                    control={control}
                    name="secondaryGuardianRelationship"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {RELATIONSHIP_OPTIONS.map((rel) => (
                            <SelectItem key={rel} value={rel} className="capitalize">
                              {rel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <label htmlFor="secondaryGuardianPhone" className="text-sm font-medium text-foreground/80 mb-1.5 block">
                    Teléfono
                  </label>
                  <Input
                    id="secondaryGuardianPhone"
                    type="tel"
                    placeholder="+54 11 1234-5678"
                    {...register('secondaryGuardianPhone')}
                    className={`h-12 text-base ${errors.secondaryGuardianPhone ? 'border-destructive' : ''}`}
                  />
                  <FieldError message={errors.secondaryGuardianPhone?.message} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-12 text-base rounded-xl"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 text-base rounded-xl shadow-md shadow-primary/20"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                Guardando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {isEditing ? 'Guardar Cambios' : 'Crear Niño'}
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

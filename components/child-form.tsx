'use client'

import { useState } from 'react'
import { ArrowLeft, User, Heart, Phone, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { saveChild, generateId } from '@/lib/db'
import type { Child, House, Medication, RelationshipType } from '@/lib/types'
import { RELATIONSHIP_OPTIONS } from '@/lib/types'

interface ChildFormProps {
  child?: Child
  houses: House[]
  onClose: () => void
}

export function ChildForm({ child, houses, onClose }: ChildFormProps) {
  const [formData, setFormData] = useState({
    houseId: child?.houseId || '',
    firstName: child?.firstName || '',
    lastName: child?.lastName || '',
    dateOfBirth: child?.dateOfBirth || '',
    gender: child?.gender || 'masculino' as 'masculino' | 'femenino' | 'otro',
    isActive: child?.isActive ?? true,
    isCeliac: child?.health.isCeliac || false,
    foodAllergies: child?.health.foodAllergies || '',
    medications: child?.health.medications || [] as Medication[],
    otherConditions: child?.health.otherConditions || '',
    primaryGuardianName: child?.primaryGuardian.name || '',
    primaryGuardianRelationship: child?.primaryGuardian.relationship || 'mamá',
    primaryGuardianPhone: child?.primaryGuardian.phone || '',
    secondaryGuardianName: child?.secondaryGuardian?.name || '',
    secondaryGuardianRelationship: child?.secondaryGuardian?.relationship || '',
    secondaryGuardianPhone: child?.secondaryGuardian?.phone || ''
  })

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: '', dose: '', frequency: '' }]
    })
  }

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...formData.medications]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, medications: updated })
  }

  const removeMedication = (index: number) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const childData: Child = {
      id: child?.id || generateId(),
      houseId: formData.houseId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      isActive: formData.isActive,
      health: {
        isCeliac: formData.isCeliac,
        foodAllergies: formData.foodAllergies,
        medications: formData.medications.filter(m => m.name.trim() !== ''),
        otherConditions: formData.otherConditions
      },
      primaryGuardian: {
        name: formData.primaryGuardianName,
        relationship: formData.primaryGuardianRelationship,
        phone: formData.primaryGuardianPhone
      },
      secondaryGuardian: formData.secondaryGuardianName ? {
        name: formData.secondaryGuardianName,
        relationship: formData.secondaryGuardianRelationship,
        phone: formData.secondaryGuardianPhone
      } : undefined,
      createdAt: child?.createdAt || new Date().toISOString()
    }

    await saveChild(childData)
    onClose()
  }

  const isEditing = !!child

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-safe-top pb-6">
        <div className="pt-8 flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">
            {isEditing ? 'Editar Niño' : 'Nuevo Niño'}
          </h1>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-4">
        {/* Basic Info */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Información Básica</h2>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Casa *
              </label>
              <Select value={formData.houseId} onValueChange={(v) => setFormData({ ...formData, houseId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar casa" />
                </SelectTrigger>
                <SelectContent>
                  {houses.map(house => (
                    <SelectItem key={house.id} value={house.id}>
                      {house.address.street} {house.address.number} - {house.address.barrio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Nombre *
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Nombre"
                  className="h-12 text-base"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Apellido *
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Apellido"
                  className="h-12 text-base"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Fecha de Nacimiento *
                </label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="h-12 text-base"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Género *
                </label>
                <Select value={formData.gender} onValueChange={(v: 'masculino' | 'femenino' | 'otro') => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Estado Activo</label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Health */}
        <Card className="border-0 shadow-md bg-warning/5">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-warning" />
              <h2 className="font-semibold text-foreground">Salud y Necesidades Especiales</h2>
            </div>

            <div className="flex items-center justify-between bg-warning/10 rounded-lg p-3">
              <label className="text-sm font-medium text-foreground">Celíaco / Sin TACC</label>
              <Switch
                checked={formData.isCeliac}
                onCheckedChange={(v) => setFormData({ ...formData, isCeliac: v })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Alergias Alimentarias
              </label>
              <Input
                value={formData.foodAllergies}
                onChange={(e) => setFormData({ ...formData, foodAllergies: e.target.value })}
                placeholder="Ej: Maní, nueces, mariscos"
                className="h-12 text-base"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Medicamentos</label>
                <Button type="button" variant="outline" size="sm" onClick={addMedication} className="gap-1">
                  <Plus className="w-4 h-4" />
                  Agregar
                </Button>
              </div>
              {formData.medications.map((med, index) => (
                <div key={index} className="bg-card rounded-lg p-3 mb-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Medicamento {index + 1}</span>
                    <button type="button" onClick={() => removeMedication(index)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Input
                    value={med.name}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    placeholder="Nombre del medicamento"
                    className="text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={med.dose}
                      onChange={(e) => updateMedication(index, 'dose', e.target.value)}
                      placeholder="Dosis"
                      className="text-sm"
                    />
                    <Input
                      value={med.frequency}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      placeholder="Frecuencia"
                      className="text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Otras Condiciones
              </label>
              <Textarea
                value={formData.otherConditions}
                onChange={(e) => setFormData({ ...formData, otherConditions: e.target.value })}
                placeholder="Ej: Asma, diabetes, condiciones de movilidad, etc."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Guardians */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Contacto Principal *</h2>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Nombre del Tutor *
              </label>
              <Input
                value={formData.primaryGuardianName}
                onChange={(e) => setFormData({ ...formData, primaryGuardianName: e.target.value })}
                placeholder="Nombre completo"
                className="h-12 text-base"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Relación *
                </label>
                <Select 
                  value={formData.primaryGuardianRelationship} 
                  onValueChange={(v) => setFormData({ ...formData, primaryGuardianRelationship: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map(rel => (
                      <SelectItem key={rel} value={rel} className="capitalize">{rel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Teléfono *
                </label>
<Input
                    type="tel"
                    value={formData.primaryGuardianPhone}
                    onChange={(e) => setFormData({ ...formData, primaryGuardianPhone: e.target.value })}
                    placeholder="+54 11 1234-5678"
                    className="h-12 text-base"
                    required
                  />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Guardian */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Contacto Secundario (Opcional)</h2>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Nombre del Tutor
              </label>
              <Input
                value={formData.secondaryGuardianName}
                onChange={(e) => setFormData({ ...formData, secondaryGuardianName: e.target.value })}
                placeholder="Nombre completo"
                className="h-12 text-base"
              />
            </div>

            {formData.secondaryGuardianName && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Relación
                  </label>
                  <Select 
                    value={formData.secondaryGuardianRelationship} 
                    onValueChange={(v) => setFormData({ ...formData, secondaryGuardianRelationship: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_OPTIONS.map(rel => (
                        <SelectItem key={rel} value={rel} className="capitalize">{rel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    value={formData.secondaryGuardianPhone}
                    onChange={(e) => setFormData({ ...formData, secondaryGuardianPhone: e.target.value })}
                    placeholder="+54 11 1234-5678"
                    className="h-12 text-base"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1 h-12 text-base" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 h-12 text-base">
            {isEditing ? 'Guardar Cambios' : 'Crear Niño'}
          </Button>
        </div>
      </form>
    </div>
  )
}

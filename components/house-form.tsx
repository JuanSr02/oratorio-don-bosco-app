'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { saveHouse, generateId } from '@/lib/db'
import { useDataStore, useToastStore } from '@/lib/store'
import { houseSchema, type HouseFormData } from '@/lib/schemas'
import type { House } from '@/lib/types'

interface HouseFormProps {
  house?: House
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

export function HouseForm({ house, onClose }: HouseFormProps) {
  const { upsertHouse } = useDataStore()
  const { addToast } = useToastStore()
  const isEditing = !!house

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<HouseFormData>({
    resolver: zodResolver(houseSchema),
    mode: 'onBlur',
    defaultValues: {
      street: house?.address.street ?? '',
      number: house?.address.number ?? '',
      barrio: house?.address.barrio ?? '',
      reference: house?.reference ?? '',
      gpsNote: house?.gpsNote ?? '',
    },
  })

  const onSubmit = async (data: HouseFormData) => {
    const houseData: House = {
      id: house?.id ?? generateId(),
      address: {
        street: data.street,
        number: data.number,
        barrio: data.barrio,
      },
      reference: data.reference ?? '',
      gpsNote: data.gpsNote ?? '',
      createdAt: house?.createdAt ?? new Date().toISOString(),
    }

    await saveHouse(houseData)
    upsertHouse(houseData)
    addToast(isEditing ? 'Casa actualizada correctamente' : 'Casa creada correctamente', 'success')
    onClose()
  }

  return (
    <div className="min-h-screen bg-background pb-24">
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
            <h1 className="text-xl font-bold">{isEditing ? 'Editar Casa' : 'Nueva Casa'}</h1>
            <p className="text-sm opacity-75 mt-0.5">
              {isEditing ? 'Modificá los datos de la casa' : 'Registrá una nueva casa en el sistema'}
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-4 py-6 space-y-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-semibold text-foreground">Dirección</h2>
            </div>

            {/* Calle */}
            <div>
              <label htmlFor="street" className="text-sm font-medium text-foreground/80 mb-1.5 block">
                Calle <span className="text-destructive">*</span>
              </label>
              <Input
                id="street"
                placeholder="Ej: Av. San Martín"
                {...register('street')}
                className={`h-12 text-base ${errors.street ? 'border-destructive' : ''}`}
              />
              <FieldError message={errors.street?.message} />
            </div>

            {/* Número y Barrio */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="number" className="text-sm font-medium text-foreground/80 mb-1.5 block">
                  Número <span className="text-destructive">*</span>
                </label>
                <Input
                  id="number"
                  placeholder="Ej: 1234"
                  {...register('number')}
                  className={`h-12 text-base ${errors.number ? 'border-destructive' : ''}`}
                />
                <FieldError message={errors.number?.message} />
              </div>
              <div>
                <label htmlFor="barrio" className="text-sm font-medium text-foreground/80 mb-1.5 block">
                  Barrio <span className="text-destructive">*</span>
                </label>
                <Input
                  id="barrio"
                  placeholder="Ej: Villa Esperanza"
                  {...register('barrio')}
                  className={`h-12 text-base ${errors.barrio ? 'border-destructive' : ''}`}
                />
                <FieldError message={errors.barrio?.message} />
              </div>
            </div>

            {/* Referencia */}
            <div>
              <label htmlFor="reference" className="text-sm font-medium text-foreground/80 mb-1.5 block">
                Referencia
              </label>
              <Textarea
                id="reference"
                placeholder="Ej: Casa celeste con portón negro, al lado de la despensa"
                {...register('reference')}
                rows={2}
                className={errors.reference ? 'border-destructive' : ''}
              />
              <FieldError message={errors.reference?.message} />
            </div>

            {/* GPS Note */}
            <div>
              <label htmlFor="gpsNote" className="text-sm font-medium text-foreground/80 mb-1.5 block">
                Nota GPS / Ubicación
              </label>
              <Textarea
                id="gpsNote"
                placeholder="Ej: Frente a la plaza del barrio"
                {...register('gpsNote')}
                rows={2}
                className={errors.gpsNote ? 'border-destructive' : ''}
              />
              <FieldError message={errors.gpsNote?.message} />
            </div>
          </CardContent>
        </Card>

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
            disabled={isSubmitting || (!isDirty && isEditing)}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                Guardando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {isEditing ? 'Guardar Cambios' : 'Crear Casa'}
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

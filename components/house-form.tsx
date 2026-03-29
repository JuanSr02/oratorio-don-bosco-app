'use client'

import { useState } from 'react'
import { ArrowLeft, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { saveHouse, generateId } from '@/lib/db'
import type { House } from '@/lib/types'

interface HouseFormProps {
  house?: House
  onClose: () => void
}

export function HouseForm({ house, onClose }: HouseFormProps) {
  const [formData, setFormData] = useState({
    street: house?.address.street || '',
    number: house?.address.number || '',
    barrio: house?.address.barrio || '',
    reference: house?.reference || '',
    gpsNote: house?.gpsNote || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const houseData: House = {
      id: house?.id || generateId(),
      address: {
        street: formData.street,
        number: formData.number,
        barrio: formData.barrio
      },
      reference: formData.reference,
      gpsNote: formData.gpsNote,
      createdAt: house?.createdAt || new Date().toISOString()
    }

    await saveHouse(houseData)
    onClose()
  }

  const isEditing = !!house

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-safe-top pb-6">
        <div className="pt-8 flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">
            {isEditing ? 'Editar Casa' : 'Nueva Casa'}
          </h1>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 py-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Dirección</h2>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Calle *
              </label>
              <Input
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="Ej: Av. San Martín"
                className="h-12 text-base"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Número *
                </label>
                <Input
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="Ej: 1234"
                  className="h-12 text-base"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Barrio *
                </label>
                <Input
                  value={formData.barrio}
                  onChange={(e) => setFormData({ ...formData, barrio: e.target.value })}
                  placeholder="Ej: Villa Esperanza"
                  className="h-12 text-base"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Referencia
              </label>
              <Textarea
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Ej: Casa celeste con portón negro, al lado de la despensa"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Nota GPS / Ubicación
              </label>
              <Textarea
                value={formData.gpsNote}
                onChange={(e) => setFormData({ ...formData, gpsNote: e.target.value })}
                placeholder="Ej: Frente a la plaza del barrio"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" className="flex-1 h-12 text-base" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 h-12 text-base">
            {isEditing ? 'Guardar Cambios' : 'Crear Casa'}
          </Button>
        </div>
      </form>
    </div>
  )
}

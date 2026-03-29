'use client'

import { ArrowLeft, User, AlertTriangle, Phone, MapPin, Edit, Trash2, Pill, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { calculateAge, hasSpecialNeeds, deleteChild } from '@/lib/db'
import type { Child, House } from '@/lib/types'

interface ChildDetailProps {
  child: Child
  house?: House
  onClose: () => void
  onEdit: (child: Child) => void
}

export function ChildDetail({ child, house, onClose, onEdit }: ChildDetailProps) {
  const age = calculateAge(child.dateOfBirth)
  const specialNeeds = hasSpecialNeeds(child)

  const handleDelete = async () => {
    if (confirm(`¿Estás seguro de eliminar a ${child.firstName} ${child.lastName}?`)) {
      await deleteChild(child.id)
      onClose()
    }
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-safe-top pb-6">
        <div className="pt-8 flex items-center gap-3 mb-4">
          <button onClick={onClose} className="p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Perfil del Niño</h1>
        </div>
        
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{child.firstName} {child.lastName}</h2>
            <p className="text-sm opacity-90">{age} años • {child.gender}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={child.isActive ? 'secondary' : 'outline'} className="text-xs">
                {child.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Health Alerts */}
        {specialNeeds && (
          <Card className="border-0 shadow-md bg-destructive/5 border-l-4 border-l-destructive">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h3 className="font-semibold text-foreground">Alertas de Salud</h3>
              </div>
              
              <div className="space-y-2">
                {child.health.isCeliac && (
                  <div className="flex items-center gap-2 bg-warning/20 rounded-lg p-2">
                    <Badge variant="outline" className="bg-warning text-warning-foreground border-warning">
                      Sin TACC
                    </Badge>
                    <span className="text-sm text-foreground">Celíaco - Requiere comida sin gluten</span>
                  </div>
                )}
                
                {child.health.foodAllergies && (
                  <div className="bg-destructive/10 rounded-lg p-2">
                    <p className="text-xs font-medium text-destructive uppercase mb-1">Alergias</p>
                    <p className="text-sm text-foreground">{child.health.foodAllergies}</p>
                  </div>
                )}
                
                {child.health.medications.length > 0 && (
                  <div className="bg-accent/30 rounded-lg p-2">
                    <p className="text-xs font-medium text-accent-foreground uppercase mb-1">Medicamentos</p>
                    {child.health.medications.map((med, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-foreground">
                        <Pill className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{med.name} - {med.dose} ({med.frequency})</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {child.health.otherConditions && (
                  <div className="bg-muted rounded-lg p-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Otras Condiciones</p>
                    <p className="text-sm text-foreground">{child.health.otherConditions}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* House Info */}
        {house && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Domicilio</h3>
              </div>
              
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  {house.address.street} {house.address.number}
                </p>
                <p className="text-sm text-muted-foreground">{house.address.barrio}</p>
                {house.reference && (
                  <p className="text-sm text-muted-foreground mt-2">{house.reference}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Primary Guardian */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Contacto Principal</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{child.primaryGuardian.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{child.primaryGuardian.relationship}</p>
              </div>
              <Button
                variant="default"
                className="gap-2 h-11 px-4"
                onClick={() => handleCall(child.primaryGuardian.phone)}
              >
                <Phone className="w-4 h-4" />
                Llamar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{child.primaryGuardian.phone}</p>
          </CardContent>
        </Card>

        {/* Secondary Guardian */}
        {child.secondaryGuardian && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Contacto Secundario</h3>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{child.secondaryGuardian.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{child.secondaryGuardian.relationship}</p>
                </div>
                <Button
                  variant="outline"
                  className="gap-2 h-11 px-4"
                  onClick={() => handleCall(child.secondaryGuardian!.phone)}
                >
                  <Phone className="w-4 h-4" />
                  Llamar
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{child.secondaryGuardian.phone}</p>
            </CardContent>
          </Card>
        )}

        {/* Health Status - If no special needs */}
        {!specialNeeds && (
          <Card className="border-0 shadow-md bg-success/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-success" />
                <p className="font-medium text-foreground">Sin necesidades especiales registradas</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 gap-2 h-12 text-base"
            onClick={() => onEdit(child)}
          >
            <Edit className="w-5 h-5" />
            Editar
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2 h-12 text-base"
            onClick={handleDelete}
          >
            <Trash2 className="w-5 h-5" />
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}

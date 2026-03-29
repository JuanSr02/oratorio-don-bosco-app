'use client'

import { useState, useEffect } from 'react'
import { Calendar, Check, User, AlertTriangle, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  getChildren, 
  getHouses, 
  getNextSaturday, 
  getAttendanceByDate, 
  saveAttendance, 
  generateId,
  calculateAge,
  hasSpecialNeeds
} from '@/lib/db'
import type { Child, House, AttendanceRecord } from '@/lib/types'

export function AttendanceScreen() {
  const [children, setChildren] = useState<Child[]>([])
  const [houses, setHouses] = useState<House[]>([])
  const [presentChildren, setPresentChildren] = useState<Set<string>>(new Set())
  const [isSaved, setIsSaved] = useState(false)

  const nextSaturday = getNextSaturday()
  const dateKey = nextSaturday.toISOString().split('T')[0]
  const formattedDate = nextSaturday.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  useEffect(() => {
    async function loadData() {
      const allChildren = await getChildren()
      const loadedChildren = allChildren.filter(c => c.isActive)
      const loadedHouses = await getHouses()
      setChildren(loadedChildren)
      setHouses(loadedHouses)

      // Load existing attendance for this date
      const existing = await getAttendanceByDate(dateKey)
      if (existing) {
        setPresentChildren(new Set(existing.childrenPresent))
      }
    }
    loadData()
  }, [dateKey])

  const getHouseForChild = (houseId: string) => houses.find(h => h.id === houseId)

  // Group children by house
  const childrenByHouse = children.reduce((acc, child) => {
    const house = getHouseForChild(child.houseId)
    const barrio = house?.address.barrio || 'Sin barrio'
    if (!acc[barrio]) {
      acc[barrio] = []
    }
    acc[barrio].push(child)
    return acc
  }, {} as Record<string, Child[]>)

  const toggleChild = (childId: string) => {
    const newSet = new Set(presentChildren)
    if (newSet.has(childId)) {
      newSet.delete(childId)
    } else {
      newSet.add(childId)
    }
    setPresentChildren(newSet)
    setIsSaved(false)
  }

  const handleSave = async () => {
    const record: AttendanceRecord = {
      id: generateId(),
      date: dateKey,
      childrenPresent: Array.from(presentChildren),
      createdAt: new Date().toISOString()
    }
    await saveAttendance(record)
    setIsSaved(true)
  }

  const selectAll = () => {
    setPresentChildren(new Set(children.map(c => c.id)))
    setIsSaved(false)
  }

  const deselectAll = () => {
    setPresentChildren(new Set())
    setIsSaved(false)
  }

  return (
    <div className="min-h-screen bg-background pb-44">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-safe-top pb-6">
        <div className="pt-8">
          <h1 className="text-xl font-bold">Asistencia</h1>
          <div className="flex items-center gap-2 mt-2 opacity-90">
            <Calendar className="w-5 h-5" />
            <span className="capitalize">{formattedDate}</span>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="px-4 py-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{presentChildren.size}</p>
                  <p className="text-sm text-muted-foreground">de {children.length} niños</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Todos
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Ninguno
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children List */}
      <div className="px-4 space-y-4">
        {children.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No hay niños activos</p>
              <p className="text-muted-foreground">
                Agregá niños desde la sección de Niños para poder tomar asistencia
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(childrenByHouse).sort().map(([barrio, barrioChildren]) => (
            <div key={barrio}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-2 px-1">
                {barrio}
              </h2>
              <Card className="border-0 shadow-md overflow-hidden">
                <CardContent className="p-0">
                  {barrioChildren.map((child, index) => {
                    const isPresent = presentChildren.has(child.id)
                    const specialNeeds = hasSpecialNeeds(child)
                    const age = calculateAge(child.dateOfBirth)

                    return (
                      <button
                        key={child.id}
                        onClick={() => toggleChild(child.id)}
                        className={`w-full flex items-center gap-3 p-4 min-h-[60px] text-left transition-colors ${
                          index > 0 ? 'border-t border-border' : ''
                        } ${isPresent ? 'bg-success/10' : ''}`}
                      >
                        <div className={`w-7 h-7 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isPresent 
                            ? 'bg-success border-success text-success-foreground' 
                            : 'border-input'
                        }`}>
                          {isPresent && <Check className="w-5 h-5" />}
                        </div>
                        
                        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground text-base">
                              {child.firstName} {child.lastName}
                            </span>
                            {specialNeeds && (
                              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{age} años</p>
                        </div>

                        {child.health.isCeliac && (
                          <Badge variant="outline" className="bg-warning/20 text-warning-foreground border-warning text-xs flex-shrink-0">
                            Sin TACC
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>

      {/* Save Button - Fixed at bottom */}
      {children.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 pb-safe-bottom bg-gradient-to-t from-background via-background to-transparent pt-8">
          <Button
            onClick={handleSave}
            className="w-full h-14 text-base font-semibold gap-2"
            disabled={isSaved}
          >
            {isSaved ? (
              <>
                <Check className="w-5 h-5" />
                Guardado
              </>
            ) : (
              'Guardar Asistencia'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

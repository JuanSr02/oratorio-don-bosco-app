'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, MapPin, ChevronDown, ChevronUp, Users, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getHouses, getChildrenByHouse, deleteHouse } from '@/lib/db'
import type { House, Child } from '@/lib/types'
import { HouseForm } from './house-form'

export function HousesList() {
  const [houses, setHouses] = useState<House[]>([])
  const [search, setSearch] = useState('')
  const [barrioFilter, setBarrioFilter] = useState<string>('all')
  const [expandedHouse, setExpandedHouse] = useState<string | null>(null)
  const [childrenByHouse, setChildrenByHouse] = useState<Record<string, Child[]>>({})
  const [showForm, setShowForm] = useState(false)
  const [editingHouse, setEditingHouse] = useState<House | null>(null)

  const loadData = async () => {
    const loadedHouses = await getHouses()
    setHouses(loadedHouses)
    
    const childrenMap: Record<string, Child[]> = {}
    await Promise.all(loadedHouses.map(async house => {
      childrenMap[house.id] = await getChildrenByHouse(house.id)
    }))
    setChildrenByHouse(childrenMap)
  }

  useEffect(() => {
    loadData()
  }, [])

  const barrios = [...new Set(houses.map(h => h.address.barrio))].sort()

  const filteredHouses = houses.filter(house => {
    const matchesSearch = 
      house.address.street.toLowerCase().includes(search.toLowerCase()) ||
      house.address.barrio.toLowerCase().includes(search.toLowerCase()) ||
      house.reference.toLowerCase().includes(search.toLowerCase())
    
    const matchesBarrio = barrioFilter === 'all' || house.address.barrio === barrioFilter
    
    return matchesSearch && matchesBarrio
  })

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta casa? También se eliminarán todos los niños asociados.')) {
      await deleteHouse(id)
      loadData()
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingHouse(null)
    loadData()
  }

  if (showForm || editingHouse) {
    return (
      <HouseForm
        house={editingHouse || undefined}
        onClose={handleFormClose}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-safe-top pb-6">
        <div className="pt-8 flex items-center justify-between">
          <h1 className="text-xl font-bold">Casas</h1>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="px-4 py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por dirección o referencia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
        
        <Select value={barrioFilter} onValueChange={setBarrioFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por barrio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los barrios</SelectItem>
            {barrios.map(barrio => (
              <SelectItem key={barrio} value={barrio}>{barrio}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-4 z-10 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-transform"
        aria-label="Agregar casa"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Houses List */}
      <div className="px-4 space-y-3">
        {filteredHouses.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No hay casas cargadas</p>
              <p className="text-muted-foreground mb-4">Empezá agregando una casa para registrar niños</p>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Agregar Casa
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredHouses.map(house => {
            const children = childrenByHouse[house.id] || []
            const activeChildren = children.filter(c => c.isActive)
            const isExpanded = expandedHouse === house.id

            return (
              <Card key={house.id} className="border-0 shadow-md overflow-hidden">
                <CardContent className="p-0">
                  <button
                    onClick={() => setExpandedHouse(isExpanded ? null : house.id)}
                    className="w-full p-4 min-h-[72px] text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {house.address.barrio}
                          </Badge>
                          <Badge variant="outline" className="text-xs gap-1">
                            <Users className="w-3 h-3" />
                            {activeChildren.length}
                          </Badge>
                        </div>
                        <p className="font-semibold text-foreground">
                          {house.address.street} {house.address.number}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {house.reference}
                        </p>
                      </div>
                      <div className="ml-2">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border bg-muted/30">
                      {house.gpsNote && (
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-xs text-muted-foreground uppercase mb-1">Referencia GPS</p>
                          <p className="text-sm text-foreground">{house.gpsNote}</p>
                        </div>
                      )}
                      
                      <div className="px-4 py-3">
                        <p className="text-xs text-muted-foreground uppercase mb-2">
                          Niños en esta casa ({children.length})
                        </p>
                        {children.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">
                            No hay niños registrados en esta casa
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {children.map(child => (
                              <div 
                                key={child.id} 
                                className="flex items-center justify-between bg-card rounded-lg p-2"
                              >
                                <span className="text-sm font-medium text-foreground">
                                  {child.firstName} {child.lastName}
                                </span>
                                <Badge 
                                  variant={child.isActive ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {child.isActive ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="px-4 py-3 border-t border-border flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 gap-1 h-11"
                          onClick={() => setEditingHouse(house)}
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground gap-1 h-11 w-11"
                          onClick={() => handleDelete(house.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

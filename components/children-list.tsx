'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Users, AlertTriangle, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getChildren, getHouses, calculateAge, hasSpecialNeeds } from '@/lib/db'
import type { Child, House } from '@/lib/types'
import { ChildForm } from './child-form'
import { ChildDetail } from './child-detail'

export function ChildrenList() {
  const [children, setChildren] = useState<Child[]>([])
  const [houses, setHouses] = useState<House[]>([])
  const [search, setSearch] = useState('')
  const [barrioFilter, setBarrioFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [specialNeedsFilter, setSpecialNeedsFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [viewingChild, setViewingChild] = useState<Child | null>(null)

  const loadData = async () => {
    setChildren(await getChildren())
    setHouses(await getHouses())
  }

  useEffect(() => {
    loadData()
  }, [])

  const getHouseForChild = (houseId: string) => houses.find(h => h.id === houseId)
  const barrios = [...new Set(houses.map(h => h.address.barrio))].sort()

  const filteredChildren = children.filter(child => {
    const house = getHouseForChild(child.houseId)
    
    const matchesSearch = 
      child.firstName.toLowerCase().includes(search.toLowerCase()) ||
      child.lastName.toLowerCase().includes(search.toLowerCase())
    
    const matchesBarrio = barrioFilter === 'all' || house?.address.barrio === barrioFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && child.isActive) ||
      (statusFilter === 'inactive' && !child.isActive)
    const matchesSpecialNeeds = specialNeedsFilter === 'all' ||
      (specialNeedsFilter === 'yes' && hasSpecialNeeds(child)) ||
      (specialNeedsFilter === 'no' && !hasSpecialNeeds(child))
    
    return matchesSearch && matchesBarrio && matchesStatus && matchesSpecialNeeds
  })

  const handleFormClose = () => {
    setShowForm(false)
    setEditingChild(null)
    loadData()
  }

  const handleDetailClose = () => {
    setViewingChild(null)
    loadData()
  }

  const handleEditFromDetail = (child: Child) => {
    setViewingChild(null)
    setEditingChild(child)
  }

  if (showForm || editingChild) {
    return (
      <ChildForm
        child={editingChild || undefined}
        houses={houses}
        onClose={handleFormClose}
      />
    )
  }

  if (viewingChild) {
    return (
      <ChildDetail
        child={viewingChild}
        house={getHouseForChild(viewingChild.houseId)}
        onClose={handleDetailClose}
        onEdit={handleEditFromDetail}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-safe-top pb-6">
        <div className="pt-8 flex items-center justify-between">
          <h1 className="text-xl font-bold">Niños</h1>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="px-4 py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <Select value={barrioFilter} onValueChange={setBarrioFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Barrio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {barrios.map(barrio => (
                <SelectItem key={barrio} value={barrio}>{barrio}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={specialNeedsFilter} onValueChange={setSpecialNeedsFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Especial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="yes">Con necesidades</SelectItem>
              <SelectItem value="no">Sin necesidades</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Floating Action Button */}
      {houses.length > 0 && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-24 right-4 z-10 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-transform"
          aria-label="Agregar niño"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Children List */}
      <div className="px-4 space-y-3">
        {houses.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">Primero agregá una casa</p>
              <p className="text-muted-foreground">
                Necesitás tener al menos una casa registrada para poder agregar niños
              </p>
            </CardContent>
          </Card>
        ) : filteredChildren.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No hay niños cargados</p>
              <p className="text-muted-foreground mb-4">Empezá agregando un niño al sistema</p>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Agregar Niño
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredChildren.map(child => {
            const house = getHouseForChild(child.houseId)
            const age = calculateAge(child.dateOfBirth)
            const specialNeeds = hasSpecialNeeds(child)

            return (
              <Card
                key={child.id}
                className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setViewingChild(child)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">
                          {child.firstName} {child.lastName}
                        </h3>
                        {specialNeeds && (
                          <Badge variant="destructive" className="gap-1 text-xs">
                            <AlertTriangle className="w-3 h-3" />
                            Alerta
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {age} años • {house?.address.barrio || 'Sin barrio'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={child.isActive ? 'default' : 'secondary'} className="text-xs">
                          {child.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {child.health.isCeliac && (
                          <Badge variant="outline" className="text-xs bg-warning/20 text-warning-foreground border-warning">
                            Sin TACC
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

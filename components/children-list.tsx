'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Users, AlertTriangle, User, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getChildren, getHouses, calculateAge, hasSpecialNeeds } from '@/lib/db'
import { useDataStore } from '@/lib/store'
import type { Child, House } from '@/lib/types'
import { ChildForm } from './child-form'
import { ChildDetail } from './child-detail'

export function ChildrenList() {
  const {
    children, houses, childrenLoaded, housesLoaded,
    setChildren, setHouses, isLoadingChildren, setLoadingChildren
  } = useDataStore()
  const [search, setSearch] = useState('')
  const [barrioFilter, setBarrioFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [specialNeedsFilter, setSpecialNeedsFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [viewingChild, setViewingChild] = useState<Child | null>(null)

  const loadData = async () => {
    setLoadingChildren(true)
    const [loadedChildren, loadedHouses] = await Promise.all([getChildren(), getHouses()])
    setChildren(loadedChildren)
    setHouses(loadedHouses)
    setLoadingChildren(false)
  }

  useEffect(() => {
    if (!childrenLoaded || !housesLoaded) loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getHouseForChild = (houseId: string) => houses.find((h) => h.id === houseId)
  const barrios = [...new Set(houses.map((h) => h.address.barrio))].sort()

  const filteredChildren = children.filter((child) => {
    const house = getHouseForChild(child.houseId)
    const matchesSearch =
      child.firstName.toLowerCase().includes(search.toLowerCase()) ||
      child.lastName.toLowerCase().includes(search.toLowerCase())
    const matchesBarrio = barrioFilter === 'all' || house?.address.barrio === barrioFilter
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && child.isActive) ||
      (statusFilter === 'inactive' && !child.isActive)
    const matchesSpecialNeeds =
      specialNeedsFilter === 'all' ||
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
      <ChildForm child={editingChild || undefined} houses={houses} onClose={handleFormClose} />
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

  const activeCount = children.filter((c) => c.isActive).length

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-safe-top pb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="relative pt-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Niños</h1>
            <p className="text-sm opacity-75 mt-0.5">
              {activeCount} activo{activeCount !== 1 ? 's' : ''} · {children.length} en total
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary-foreground/15 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="px-4 py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="grid grid-cols-3 gap-1.5 flex-1">
            <Select value={barrioFilter} onValueChange={setBarrioFilter}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="Barrio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {barrios.map((barrio) => (
                  <SelectItem key={barrio} value={barrio}>{barrio}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={specialNeedsFilter} onValueChange={setSpecialNeedsFilter}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="Salud" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="yes">Con alerta</SelectItem>
                <SelectItem value="no">Sin alerta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* FAB */}
      {houses.length > 0 && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-24 right-4 z-10 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 flex items-center justify-center hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Agregar niño"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Children List */}
      <div className="px-4 space-y-3">
        {isLoadingChildren ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted/60 animate-pulse" />
          ))
        ) : houses.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-1">Primero agregá una casa</p>
              <p className="text-sm text-muted-foreground">
                Necesitás al menos una casa para poder registrar niños
              </p>
            </CardContent>
          </Card>
        ) : filteredChildren.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-1">
                {search || barrioFilter !== 'all' || statusFilter !== 'all' || specialNeedsFilter !== 'all'
                  ? 'Sin resultados'
                  : 'No hay niños cargados'}
              </p>
              <p className="text-sm text-muted-foreground mb-5">
                {search || barrioFilter !== 'all'
                  ? 'Probá con otros filtros'
                  : 'Empezá agregando un niño al sistema'}
              </p>
              {!search && barrioFilter === 'all' && statusFilter === 'all' && (
                <Button onClick={() => setShowForm(true)} className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" />
                  Agregar Niño
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredChildren.map((child) => {
            const house = getHouseForChild(child.houseId)
            const age = calculateAge(child.dateOfBirth)
            const specialNeeds = hasSpecialNeeds(child)

            return (
              <Card
                key={child.id}
                className="border-0 shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => setViewingChild(child)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      child.gender === 'masculino' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      child.gender === 'femenino' ? 'bg-pink-100 dark:bg-pink-900/30' :
                      'bg-primary/10'
                    }`}>
                      <User className={`w-6 h-6 ${
                        child.gender === 'masculino' ? 'text-blue-500' :
                        child.gender === 'femenino' ? 'text-pink-500' :
                        'text-primary'
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">
                          {child.firstName} {child.lastName}
                        </h3>
                        {specialNeeds && (
                          <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {age} años · {house?.address.barrio ?? 'Sin barrio'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <Badge
                          variant={child.isActive ? 'default' : 'secondary'}
                          className="text-[10px] rounded-lg h-5 px-2"
                        >
                          {child.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {child.health.isCeliac && (
                          <Badge
                            variant="outline"
                            className="text-[10px] rounded-lg h-5 px-2 bg-warning/10 text-warning-foreground border-warning/40"
                          >
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

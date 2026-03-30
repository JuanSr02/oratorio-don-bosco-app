'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, MapPin, ChevronDown, ChevronUp, Users, Edit, Trash2, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getHouses, getChildrenByHouse, deleteHouse } from '@/lib/db'
import { useDataStore, useToastStore } from '@/lib/store'
import type { House, Child } from '@/lib/types'
import { HouseForm } from './house-form'

export function HousesList() {
  const { houses, housesLoaded, setHouses, removeHouse, isLoadingHouses, setLoadingHouses } = useDataStore()
  const { addToast } = useToastStore()
  const [search, setSearch] = useState('')
  const [barrioFilter, setBarrioFilter] = useState<string>('all')
  const [expandedHouse, setExpandedHouse] = useState<string | null>(null)
  const [childrenByHouse, setChildrenByHouse] = useState<Record<string, Child[]>>({})
  const [showForm, setShowForm] = useState(false)
  const [editingHouse, setEditingHouse] = useState<House | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadData = async () => {
    setLoadingHouses(true)
    const loadedHouses = await getHouses()
    setHouses(loadedHouses)
    const childrenMap: Record<string, Child[]> = {}
    await Promise.all(
      loadedHouses.map(async (house) => {
        childrenMap[house.id] = await getChildrenByHouse(house.id)
      })
    )
    setChildrenByHouse(childrenMap)
    setLoadingHouses(false)
  }

  useEffect(() => {
    if (!housesLoaded) loadData()
    // Always refresh children-by-house counts
    if (housesLoaded && houses.length > 0) {
      Promise.all(houses.map(async (house) => {
        const children = await getChildrenByHouse(house.id)
        return [house.id, children] as const
      })).then((entries) => {
        const map: Record<string, Child[]> = {}
        entries.forEach(([id, children]) => { map[id] = children })
        setChildrenByHouse(map)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [housesLoaded])

  const barrios = [...new Set(houses.map((h) => h.address.barrio))].sort()

  const filteredHouses = houses.filter((house) => {
    const matchesSearch =
      house.address.street.toLowerCase().includes(search.toLowerCase()) ||
      house.address.barrio.toLowerCase().includes(search.toLowerCase()) ||
      house.reference.toLowerCase().includes(search.toLowerCase())
    const matchesBarrio = barrioFilter === 'all' || house.address.barrio === barrioFilter
    return matchesSearch && matchesBarrio
  })

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta casa? También se eliminarán todos los niños asociados.')) return
    setDeletingId(id)
    await deleteHouse(id)
    removeHouse(id)
    addToast('Casa eliminada correctamente', 'success')
    setDeletingId(null)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingHouse(null)
    loadData()
  }

  if (showForm || editingHouse) {
    return <HouseForm house={editingHouse || undefined} onClose={handleFormClose} />
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-safe-top pb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="relative pt-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Casas</h1>
            <p className="text-sm opacity-75 mt-0.5">{houses.length} casa{houses.length !== 1 ? 's' : ''} registrada{houses.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary-foreground/15 flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="px-4 py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por dirección o referencia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
        {barrios.length > 0 && (
          <Select value={barrioFilter} onValueChange={setBarrioFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por barrio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los barrios</SelectItem>
              {barrios.map((barrio) => (
                <SelectItem key={barrio} value={barrio}>{barrio}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-4 z-10 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 flex items-center justify-center hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="Agregar casa"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Houses List */}
      <div className="px-4 space-y-3">
        {isLoadingHouses ? (
          // Skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted/60 animate-pulse" />
          ))
        ) : filteredHouses.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-1">
                {search || barrioFilter !== 'all' ? 'Sin resultados' : 'No hay casas cargadas'}
              </p>
              <p className="text-muted-foreground text-sm mb-5">
                {search || barrioFilter !== 'all'
                  ? 'Probá con otros filtros'
                  : 'Empezá agregando una casa para registrar niños'}
              </p>
              {!search && barrioFilter === 'all' && (
                <Button onClick={() => setShowForm(true)} className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" />
                  Agregar Casa
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredHouses.map((house) => {
            const children = childrenByHouse[house.id] || []
            const activeChildren = children.filter((c) => c.isActive)
            const isExpanded = expandedHouse === house.id
            const isDeleting = deletingId === house.id

            return (
              <Card
                key={house.id}
                className={`border-0 shadow-md overflow-hidden transition-all duration-200 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <CardContent className="p-0">
                  <button
                    onClick={() => setExpandedHouse(isExpanded ? null : house.id)}
                    className="w-full p-4 min-h-[80px] text-left hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <Badge variant="secondary" className="text-xs rounded-lg">
                            {house.address.barrio}
                          </Badge>
                          <Badge variant="outline" className="text-xs gap-1 rounded-lg">
                            <Users className="w-3 h-3" />
                            {activeChildren.length} activo{activeChildren.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <p className="font-semibold text-foreground">
                          {house.address.street} {house.address.number}
                        </p>
                        {house.reference && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{house.reference}</p>
                        )}
                      </div>
                      <div className="text-muted-foreground flex-shrink-0 mt-1">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border bg-muted/20 animate-in slide-in-from-top-1">
                      {house.gpsNote && (
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Referencia GPS</p>
                          <p className="text-sm text-foreground">{house.gpsNote}</p>
                        </div>
                      )}
                      <div className="px-4 py-3">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Niños en esta casa ({children.length})
                        </p>
                        {children.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">Sin niños registrados</p>
                        ) : (
                          <div className="space-y-1.5">
                            {children.map((child) => (
                              <div
                                key={child.id}
                                className="flex items-center justify-between bg-card rounded-xl px-3 py-2"
                              >
                                <span className="text-sm font-medium text-foreground">
                                  {child.firstName} {child.lastName}
                                </span>
                                <Badge
                                  variant={child.isActive ? 'default' : 'secondary'}
                                  className="text-xs rounded-lg"
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
                          className="flex-1 gap-1.5 h-11 rounded-xl"
                          onClick={() => setEditingHouse(house)}
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10 gap-1.5 h-11 w-11 rounded-xl"
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

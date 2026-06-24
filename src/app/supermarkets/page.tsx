"use client"

import { useState } from "react"
import { Plus, MapPin, Trash2, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/page-header"
import { useProductStore } from "@/store/useProductStore"

export default function SupermarketsPage() {
  const supermarkets = useProductStore((s) => s.supermarkets)
  const addSupermarket = useProductStore((s) => s.addSupermarket)
  const updateSupermarket = useProductStore((s) => s.updateSupermarket)
  const removeSupermarket = useProductStore((s) => s.removeSupermarket)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [notes, setNotes] = useState("")

  function handleSubmit() {
    if (!name.trim()) return

    if (editingId) {
      updateSupermarket(editingId, {
        name: name.trim(),
        city: city.trim() || null,
        notes: notes.trim() || null,
      })
    } else {
      addSupermarket({
        id: crypto.randomUUID(),
        name: name.trim(),
        city: city.trim() || null,
        notes: notes.trim() || null,
        created_at: new Date().toISOString(),
      })
    }
    resetForm()
  }

  function handleEdit(id: string) {
    const market = supermarkets.find((s) => s.id === id)
    if (!market) return
    setEditingId(id)
    setName(market.name)
    setCity(market.city ?? "")
    setNotes(market.notes ?? "")
    setDialogOpen(true)
  }

  function resetForm() {
    setName("")
    setCity("")
    setNotes("")
    setEditingId(null)
    setDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Supermercados"
        description={`${supermarkets.length} cadastrados em Minas Gerais`}
        action={
          <Button
            onClick={() => {
              resetForm()
              setDialogOpen(true)
            }}
            className="touch-target rounded-xl px-5 py-3 text-base font-bold"
          >
            <Plus className="size-6" />
            Novo
          </Button>
        }
      />

      <div className="flex flex-col gap-3 px-4 pb-4">
        {supermarkets.map((market) => (
          <Card key={market.id}>
            <CardContent className="flex items-center gap-4">
              <div
                className="flex size-14 shrink-0 items-center justify-center rounded-xl text-white font-bold text-sm"
                style={{ backgroundColor: market.color || "#6366f1" }}
              >
                {market.initials || market.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold truncate">{market.name}</p>
                {market.city && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {market.city}
                  </p>
                )}
                {market.notes && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {market.notes}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-12 rounded-xl"
                  onClick={() => handleEdit(market.id)}
                >
                  <Edit3 className="size-5" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="size-12 rounded-xl"
                  onClick={() => removeSupermarket(market.id)}
                >
                  <Trash2 className="size-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {supermarkets.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-5xl mb-3">🏪</div>
            <p className="text-lg font-semibold">Nenhum mercado cadastrado</p>
            <p className="text-muted-foreground">
              Cadastre os mercados onde você compra.
            </p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingId ? "Editar Mercado" : "Novo Mercado"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            <div>
              <Label className="text-base font-semibold mb-1">Nome</Label>
              <Input
                placeholder="Ex: Supermercado Extra"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 rounded-xl text-lg"
                autoFocus
              />
            </div>
            <div>
              <Label className="text-base font-semibold mb-1">Cidade</Label>
              <Input
                placeholder="Ex: Belo Horizonte"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-14 rounded-xl text-lg"
              />
            </div>
            <div>
              <Label className="text-base font-semibold mb-1">Observações</Label>
              <Input
                placeholder="Ex: Mais barato em carnes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-14 rounded-xl text-lg"
              />
            </div>

            <div className="flex gap-3 mt-2">
              <DialogClose
                render={
                  <Button
                    variant="outline"
                    className="flex-1 h-14 rounded-xl text-lg font-bold"
                  />
                }
              >
                Cancelar
              </DialogClose>
              <Button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="flex-1 h-14 rounded-xl text-lg font-bold"
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

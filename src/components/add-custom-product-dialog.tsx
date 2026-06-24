"use client"

import { useState } from "react"
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { useProductStore } from "@/store/useProductStore"
import { useShoppingListStore } from "@/store/useShoppingListStore"
import { cn } from "@/lib/utils"
import { PhotoCapture } from "@/components/photo-capture"

interface AddCustomProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialName?: string
}

const PRODUCT_ICONS = [
  "🛒", "📦", "🍎", "🥩", "🥤", "🧀", "🧹", "🧴",
  "🧊", "🍞", "🍚", "🫘", "🥚", "🍝", "🥫", "🌿",
]

export function AddCustomProductDialog({
  open,
  onOpenChange,
  initialName = "",
}: AddCustomProductDialogProps) {
  const categories = useProductStore((s) => s.categories)
  const addProduct = useProductStore((s) => s.addProduct)
  const addItemToList = useShoppingListStore((s) => s.addItemToList)

  const [name, setName] = useState(initialName)
  const [icon, setIcon] = useState("🛒")
  const [categoryId, setCategoryId] = useState("")
  const [addToList, setAddToList] = useState(true)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoOpen, setPhotoOpen] = useState(false)

  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order)

  function handleSubmit() {
    if (!name.trim()) return

    const productId = crypto.randomUUID()

    addProduct({
      id: productId,
      name: name.trim(),
      icon,
      photo_url: photoUrl,
      category_id: categoryId || null,
      created_at: new Date().toISOString(),
    })

    if (addToList) {
      addItemToList(productId, name.trim())
    }

    setName("")
    setIcon("🛒")
    setCategoryId("")
    setPhotoUrl(null)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Criar Produto</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            {/* Foto do produto */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPhotoOpen(true)}
                className="flex size-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted transition-colors hover:border-primary/50 overflow-hidden"
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="Foto" className="size-20 object-cover rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Camera className="size-6 text-muted-foreground" />
                    <span className="text-[0.65rem] text-muted-foreground">Foto</span>
                  </div>
                )}
              </button>
              <div className="flex-1">
                <Label className="text-base font-semibold mb-2 block">Nome do Produto</Label>
                <Input
                  placeholder="Ex: Azeite trufado..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 rounded-xl text-lg"
                  autoFocus
                />
              </div>
            </div>

            {/* Ícone */}
            <div>
              <Label className="text-base font-semibold mb-2 block">Ícone</Label>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_ICONS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl text-xl transition-all touch-target",
                      icon === ic
                        ? "bg-primary/15 ring-2 ring-primary scale-110"
                        : "bg-muted"
                    )}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Categoria */}
            <div>
              <Label className="text-base font-semibold mb-2 block">Categoria</Label>
              <div className="flex flex-wrap gap-2">
                {sortedCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(categoryId === cat.id ? "" : cat.id)}
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors touch-target",
                      categoryId === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Adicionar à lista */}
            <label className="flex items-center gap-3 rounded-xl bg-muted p-4 cursor-pointer touch-target">
              <input
                type="checkbox"
                checked={addToList}
                onChange={(e) => setAddToList(e.target.checked)}
                className="size-5 rounded accent-primary"
              />
              <span className="text-base font-medium">Adicionar à lista de compras</span>
            </label>

            <div className="flex gap-3 mt-1">
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
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PhotoCapture
        open={photoOpen}
        onOpenChange={setPhotoOpen}
        onCapture={(dataUrl) => setPhotoUrl(dataUrl)}
        title="Foto do Produto"
      />
    </>
  )
}

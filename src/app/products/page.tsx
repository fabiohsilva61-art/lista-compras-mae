"use client"

import { useState } from "react"
import {
  Plus,
  Check,
  Search,
  ShoppingCart,
  Trash2,
  Minus,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { useProductStore } from "@/store/useProductStore"
import { useShoppingListStore } from "@/store/useShoppingListStore"
import { cn } from "@/lib/utils"
import { AddCustomProductDialog } from "@/components/add-custom-product-dialog"

export default function ProductsPage() {
  const products = useProductStore((s) => s.products)
  const categories = useProductStore((s) => s.categories)
  const addItemToList = useShoppingListStore((s) => s.addItemToList)
  const lists = useShoppingListStore((s) => s.lists)
  const listItems = useShoppingListStore((s) => s.items)
  const removeItem = useShoppingListStore((s) => s.removeItem)
  const updateItemQuantity = useShoppingListStore((s) => s.updateItemQuantity)

  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [mobileListOpen, setMobileListOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order)

  const activeListId = lists.find((l) => l.status === "active")?.id
  const activeItems = listItems.filter(
    (i) => i.shopping_list_id === activeListId && !i.is_checked
  )
  const activeProductIds = new Set(activeItems.map((i) => i.product_id))

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !filterCategory || p.category_id === filterCategory
    return matchesSearch && matchesCategory
  })

  const grouped = sortedCategories
    .map((cat) => ({
      category: cat,
      products: filtered.filter((p) => p.category_id === cat.id),
    }))
    .filter((g) => g.products.length > 0)

  function handleAddToList(productId: string, productName: string) {
    addItemToList(productId, productName)
  }

  return (
    <div className="flex gap-0 lg:gap-6 relative">
      {/* ESQUERDA: Catálogo de Produtos */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <PageHeader
          title="Produtos"
          description="Toque no + para adicionar à lista"
          action={
            <Button
              onClick={() => setCreateDialogOpen(true)}
              variant="outline"
              className="touch-target rounded-xl px-4 py-3 text-sm font-bold"
            >
              <Plus className="size-5" />
              Criar
            </Button>
          }
        />

        {/* Busca */}
        <div className="px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 rounded-xl pl-11 text-lg"
            />
          </div>
        </div>

        {/* Filtro por categoria */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            onClick={() => setFilterCategory(null)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors touch-target",
              !filterCategory
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            Todos
          </button>
          {sortedCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(filterCategory === cat.id ? null : cat.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors touch-target",
                filterCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Produtos agrupados */}
        <div className="flex flex-col gap-6 px-4 pb-32 lg:pb-8">
          {filterCategory
            ? (
              <div className="grid grid-cols-2 gap-2">
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    name={product.name}
                    icon={product.icon}
                    inList={activeProductIds.has(product.id)}
                    onAdd={() => handleAddToList(product.id, product.name)}
                  />
                ))}
              </div>
            )
            : grouped.map(({ category, products: catProducts }) => (
              <div key={category.id}>
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  {category.name}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {catProducts.length}
                  </Badge>
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {catProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      name={product.name}
                      icon={product.icon}
                      inList={activeProductIds.has(product.id)}
                      onAdd={() => handleAddToList(product.id, product.name)}
                    />
                  ))}
                </div>
              </div>
            ))
          }

          {filtered.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Nenhum produto encontrado.</p>
              {search && (
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="h-14 rounded-xl text-lg font-bold px-6 touch-target"
                >
                  <Plus className="size-5 mr-2" />
                  Criar &quot;{search}&quot;
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DIREITA: Lista de Compras (Desktop - fixo) */}
      <div className="hidden lg:flex lg:w-80 xl:w-96 lg:flex-col lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)]">
        <ListPanel
          items={activeItems}
          products={products}
          onRemove={removeItem}
          onUpdateQuantity={updateItemQuantity}
        />
      </div>

      {/* MOBILE: Painel flutuante da lista */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        {/* Badge totalizador */}
        {activeItems.length > 0 && !mobileListOpen && (
          <button
            onClick={() => setMobileListOpen(true)}
            className="mx-4 mb-4 flex w-[calc(100%-2rem)] items-center gap-3 rounded-2xl bg-primary p-4 text-primary-foreground shadow-lg active:scale-[0.98] transition-transform"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary-foreground/20">
              <ShoppingCart className="size-6" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-lg font-bold">
                {activeItems.length} {activeItems.length === 1 ? "item" : "itens"} na lista
              </p>
              <p className="text-sm opacity-80">Toque para ver</p>
            </div>
            <ChevronUp className="size-6" />
          </button>
        )}

        {/* Painel expandido */}
        {mobileListOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setMobileListOpen(false)}
            />
            <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] rounded-t-3xl bg-card shadow-xl flex flex-col animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart className="size-6 text-primary" />
                  Lista ({activeItems.length})
                </h3>
                <button
                  onClick={() => setMobileListOpen(false)}
                  className="flex size-10 items-center justify-center rounded-xl touch-target"
                >
                  <X className="size-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <ListPanelContent
                  items={activeItems}
                  products={products}
                  onRemove={removeItem}
                  onUpdateQuantity={updateItemQuantity}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <AddCustomProductDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        initialName={search && filtered.length === 0 ? search : ""}
      />
    </div>
  )
}

function ProductCard({
  name,
  icon,
  inList,
  onAdd,
}: {
  name: string
  icon: string
  inList: boolean
  onAdd: () => void
}) {
  return (
    <Card
      className={cn(
        "transition-all active:scale-[0.96] cursor-pointer",
        inList && "ring-2 ring-success bg-success/5"
      )}
      onClick={() => { if (!inList) onAdd() }}
    >
      <CardContent className="flex flex-col items-center gap-1 py-3 px-2 relative">
        <span className="text-4xl leading-none" role="img" aria-label={name}>
          {icon}
        </span>
        <p className="font-semibold text-sm text-center leading-tight mt-1 min-h-[2.5rem] flex items-center">
          {name}
        </p>
        {inList ? (
          <div className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-success">
            <Check className="size-4 text-white" />
          </div>
        ) : (
          <div className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-primary/10">
            <Plus className="size-4 text-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ListPanel({
  items,
  products,
  onRemove,
  onUpdateQuantity,
}: {
  items: { id: string; product_id: string | null; product_name: string; quantity: number }[]
  products: { id: string; name: string; icon: string }[]
  onRemove: (id: string) => void
  onUpdateQuantity: (id: string, qty: number) => void
}) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden">
      <div className="p-4 border-b bg-primary/5">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="size-6 text-primary" />
          Lista de Compras
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            {items.length}
          </div>
          <span className="text-muted-foreground">
            {items.length === 1 ? "item adicionado" : "itens adicionados"}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <ListPanelContent
          items={items}
          products={products}
          onRemove={onRemove}
          onUpdateQuantity={onUpdateQuantity}
        />
      </div>
    </div>
  )
}

function ListPanelContent({
  items,
  products,
  onRemove,
  onUpdateQuantity,
}: {
  items: { id: string; product_id: string | null; product_name: string; quantity: number }[]
  products: { id: string; name: string; icon: string }[]
  onRemove: (id: string) => void
  onUpdateQuantity: (id: string, qty: number) => void
}) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <ShoppingCart className="size-10 mx-auto mb-2 opacity-30" />
        <p className="font-medium">Lista vazia</p>
        <p className="text-sm">Toque nos produtos para adicionar</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const product = products.find((p) => p.id === item.product_id)
        return (
          <div
            key={item.id}
            className="flex items-center gap-2 rounded-xl border p-2.5 bg-background"
          >
            <span className="text-2xl shrink-0" role="img">
              {product?.icon || "📦"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{item.product_name}</p>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                className="flex size-8 items-center justify-center rounded-lg bg-muted touch-target"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="flex size-8 items-center justify-center rounded-lg bg-muted touch-target"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="flex size-8 items-center justify-center rounded-lg text-destructive touch-target"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        )
      })}

      {/* Totalizador */}
      <div className="mt-2 rounded-xl bg-primary/5 border border-primary/20 p-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-base">Total de itens</span>
          <span className="text-2xl font-bold text-primary">
            {items.reduce((sum, i) => sum + i.quantity, 0)}
          </span>
        </div>
      </div>
    </div>
  )
}

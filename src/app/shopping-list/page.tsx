"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Circle,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { useShoppingListStore } from "@/store/useShoppingListStore"
import { useProductStore } from "@/store/useProductStore"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { FinalizePurchaseDialog } from "@/components/finalize-purchase-dialog"

export default function ShoppingListPage() {
  const lists = useShoppingListStore((s) => s.lists)
  const allItems = useShoppingListStore((s) => s.items)
  const toggleItem = useShoppingListStore((s) => s.toggleItem)
  const removeItem = useShoppingListStore((s) => s.removeItem)
  const updateItemQuantity = useShoppingListStore((s) => s.updateItemQuantity)
  const completeList = useShoppingListStore((s) => s.completeList)
  const [supermarketMode, setSupermarketMode] = useState(false)
  const [finalizeOpen, setFinalizeOpen] = useState(false)

  const products = useProductStore((s) => s.products)

  const activeList = lists.find((l) => l.status === "active")
  const items = activeList
    ? allItems.filter((i) => i.shopping_list_id === activeList.id)
    : []
  const unchecked = items.filter((i) => !i.is_checked)
  const checked = items.filter((i) => i.is_checked)

  function getIcon(productId: string | null) {
    if (!productId) return "📦"
    return products.find((p) => p.id === productId)?.icon || "📦"
  }

  function handleShare() {
    const listText = items
      .map((item) => {
        const icon = getIcon(item.product_id)
        const check = item.is_checked ? "✅" : "⬜"
        return `${check} ${icon} ${item.product_name} (x${item.quantity})`
      })
      .join("\n")

    const message = `🛒 *Lista de Compras*\n\n${listText}\n\n📝 ${unchecked.length} pendente(s) · ✅ ${checked.length} comprado(s)`

    if (navigator.share) {
      navigator.share({ title: "Lista de Compras", text: message })
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Lista de Compras" />
        <div className="px-4 py-12 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-xl font-bold mb-2">Lista vazia</p>
          <p className="text-muted-foreground mb-6 text-lg">
            Vá em Produtos e toque no + para adicionar itens.
          </p>
          <Link href="/products">
            <Button className="h-16 rounded-xl text-lg font-bold px-8 touch-target">
              <ShoppingBag className="size-6 mr-2" />
              Ir para Produtos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // ─── MODO SUPERMERCADO ─────────────────────────────
  if (supermarketMode) {
    return (
      <div className="flex flex-col gap-3 min-h-screen bg-background">
        <div className="sticky top-0 z-40 bg-primary text-primary-foreground p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Modo Supermercado</h1>
              <p className="text-primary-foreground/80">
                {checked.length} de {items.length} itens
              </p>
            </div>
            <Button
              onClick={() => setSupermarketMode(false)}
              variant="secondary"
              className="h-12 rounded-xl text-base font-bold"
            >
              Sair
            </Button>
          </div>
          <div className="mt-3 h-3 w-full rounded-full bg-primary-foreground/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-foreground transition-all duration-500"
              style={{
                width: `${items.length > 0 ? (checked.length / items.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 px-4 pb-32">
          {unchecked.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className="flex items-center gap-4 rounded-2xl border-2 bg-card p-5 text-left transition-all active:scale-[0.97] touch-target"
            >
              <Circle className="size-10 text-muted-foreground shrink-0" />
              <span className="text-3xl shrink-0">{getIcon(item.product_id)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold truncate">{item.product_name}</p>
                <p className="text-base text-muted-foreground">Qtd: {item.quantity}</p>
              </div>
            </button>
          ))}

          {checked.length > 0 && (
            <>
              <p className="text-base font-bold text-muted-foreground mt-4 mb-1">
                Comprados ({checked.length})
              </p>
              {checked.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className="flex items-center gap-4 rounded-2xl border-2 border-success/30 bg-success/5 p-5 text-left opacity-60 transition-all active:scale-[0.97] touch-target"
                >
                  <CheckCircle2 className="size-10 text-success shrink-0" />
                  <span className="text-3xl shrink-0">{getIcon(item.product_id)}</span>
                  <p className="text-xl font-bold truncate line-through flex-1">
                    {item.product_name}
                  </p>
                </button>
              ))}
            </>
          )}
        </div>

        {unchecked.length === 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t lg:pl-72">
            <Button
              onClick={() => {
                setSupermarketMode(false)
                setFinalizeOpen(true)
              }}
              className="w-full h-16 rounded-xl text-xl font-bold bg-success text-success-foreground touch-target"
            >
              <ShoppingCart className="size-7 mr-2" />
              Finalizar Compras
            </Button>
          </div>
        )}

        <FinalizePurchaseDialog
          open={finalizeOpen}
          onOpenChange={setFinalizeOpen}
          items={items}
          onConfirm={() => {
            if (activeList) completeList(activeList.id)
          }}
        />
      </div>
    )
  }

  // ─── MODO NORMAL ───────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Lista de Compras"
        description={`${unchecked.length} pendente${unchecked.length !== 1 ? "s" : ""} · ${checked.length} comprado${checked.length !== 1 ? "s" : ""}`}
        action={
          <Button
            onClick={handleShare}
            variant="outline"
            className="touch-target rounded-xl px-4 py-3 text-sm font-bold"
          >
            <Share2 className="size-5" />
            Enviar
          </Button>
        }
      />

      {/* Progress bar */}
      <div className="px-4">
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-success transition-all duration-500"
            style={{
              width: `${items.length > 0 ? (checked.length / items.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Modo Supermercado button */}
      <div className="px-4">
        <Button
          onClick={() => setSupermarketMode(true)}
          className="w-full h-14 rounded-xl text-lg font-bold bg-primary text-primary-foreground touch-target"
        >
          <ShoppingCart className="size-6 mr-2" />
          Modo Supermercado
        </Button>
      </div>

      {/* Pendentes */}
      <div className="flex flex-col gap-2 px-4">
        {unchecked.map((item) => (
          <Card key={item.id} className="active:scale-[0.98] transition-transform">
            <CardContent className="flex items-center gap-3">
              <button
                onClick={() => toggleItem(item.id)}
                className="shrink-0 touch-target flex items-center justify-center"
              >
                <Circle className="size-8 text-muted-foreground" />
              </button>
              <span className="text-2xl shrink-0">{getIcon(item.product_id)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold truncate">{item.product_name}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-10 rounded-lg"
                  onClick={() =>
                    updateItemQuantity(item.id, Math.max(1, item.quantity - 1))
                  }
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-10 rounded-lg"
                  onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 shrink-0"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="size-5 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comprados */}
      {checked.length > 0 && (
        <div className="px-4">
          <p className="text-sm font-bold text-muted-foreground mb-2">
            Comprados ({checked.length})
          </p>
          <div className="flex flex-col gap-2">
            {checked.map((item) => (
              <Card
                key={item.id}
                className="opacity-50 cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => toggleItem(item.id)}
              >
                <CardContent className="flex items-center gap-3">
                  <CheckCircle2 className="size-8 text-success shrink-0" />
                  <span className="text-2xl shrink-0">{getIcon(item.product_id)}</span>
                  <p className="text-lg font-semibold truncate line-through flex-1">
                    {item.product_name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex flex-col gap-3 px-4 pb-8">
        <Link href="/products">
          <Button
            variant="outline"
            className="w-full h-14 rounded-xl text-lg font-bold touch-target"
          >
            <Plus className="size-6 mr-2" />
            Adicionar Mais Itens
          </Button>
        </Link>

        {unchecked.length === 0 && items.length > 0 && (
          <Button
            onClick={() => setFinalizeOpen(true)}
            className="w-full h-16 rounded-xl text-xl font-bold bg-success text-success-foreground touch-target"
          >
            <ShoppingCart className="size-7 mr-2" />
            Finalizar Compras
          </Button>
        )}
      </div>

      <FinalizePurchaseDialog
        open={finalizeOpen}
        onOpenChange={setFinalizeOpen}
        items={items}
        onConfirm={() => {
          if (activeList) completeList(activeList.id)
        }}
      />
    </div>
  )
}

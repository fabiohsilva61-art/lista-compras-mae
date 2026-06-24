"use client"

import { ShoppingCart, Package, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { useShoppingListStore } from "@/store/useShoppingListStore"
import { useProductStore } from "@/store/useProductStore"
import Link from "next/link"

export default function DashboardPage() {
  const { lists, items } = useShoppingListStore()
  const products = useProductStore((s) => s.products)

  function getIcon(productId: string | null) {
    if (!productId) return "📦"
    return products.find((p) => p.id === productId)?.icon || "📦"
  }
  const activeList = lists.find((l) => l.status === "active")
  const activeItems = activeList
    ? items.filter((i) => i.shopping_list_id === activeList.id)
    : []
  const unchecked = activeItems.filter((i) => !i.is_checked)
  const checked = activeItems.filter((i) => i.is_checked)

  return (
    <div className="flex flex-col gap-5 px-4">
      <PageHeader
        title="Controle de Compras"
        description="Seu assistente doméstico"
      />

      {/* Ação principal */}
      <Link href="/shopping-list">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 py-2">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary">
              <ShoppingCart className="size-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xl font-bold">Lista de Compras</p>
              {activeItems.length > 0 ? (
                <p className="text-base text-muted-foreground">
                  {unchecked.length} {unchecked.length === 1 ? "item pendente" : "itens pendentes"}
                  {checked.length > 0 && ` · ${checked.length} comprado${checked.length > 1 ? "s" : ""}`}
                </p>
              ) : (
                <p className="text-base text-muted-foreground">
                  Nenhum item na lista
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Atalhos */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/products">
          <Card className="transition-shadow active:shadow-md">
            <CardContent className="flex flex-col items-center gap-2 py-5">
              <div className="flex size-14 items-center justify-center rounded-xl bg-accent">
                <Package className="size-7 text-accent-foreground" />
              </div>
              <p className="text-base font-bold text-center">Ver Produtos</p>
              <p className="text-xs text-muted-foreground text-center">
                Escolha o que está faltando
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/products">
          <Card className="transition-shadow active:shadow-md">
            <CardContent className="flex flex-col items-center gap-2 py-5">
              <div className="flex size-14 items-center justify-center rounded-xl bg-success/15">
                <Plus className="size-7 text-success" />
              </div>
              <p className="text-base font-bold text-center">Adicionar Itens</p>
              <p className="text-xs text-muted-foreground text-center">
                Montar lista de compras
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Lista rápida dos itens pendentes */}
      {unchecked.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-2">Itens Pendentes</h2>
          <div className="flex flex-col gap-2">
            {unchecked.slice(0, 5).map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-center gap-3 py-2">
                  <span className="text-3xl">{getIcon(item.product_id)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qtd: {item.quantity}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {unchecked.length > 5 && (
              <Link href="/shopping-list">
                <Button variant="outline" className="w-full h-12 rounded-xl text-base">
                  Ver todos ({unchecked.length} itens)
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {activeItems.length === 0 && (
        <div className="py-6 text-center">
          <div className="text-5xl mb-3">🏠</div>
          <p className="text-lg font-semibold">Tudo certo!</p>
          <p className="text-muted-foreground">
            Vá em Produtos para adicionar o que está faltando.
          </p>
        </div>
      )}
    </div>
  )
}

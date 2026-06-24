"use client"

import { Trash2, Store, Calendar, ShoppingBag, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { usePurchaseStore } from "@/store/usePurchaseStore"
import { useProductStore } from "@/store/useProductStore"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useState } from "react"
import { ReceiptUpload } from "@/components/receipt-upload"

export default function PurchasesPage() {
  const purchases = usePurchaseStore((s) => s.purchases)
  const purchaseItems = usePurchaseStore((s) => s.purchaseItems)
  const removePurchase = usePurchaseStore((s) => s.removePurchase)
  const supermarkets = useProductStore((s) => s.supermarkets)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [receiptOpen, setReceiptOpen] = useState(false)

  const sorted = [...purchases].sort(
    (a, b) =>
      new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime()
  )

  const totalSpent = purchases.reduce(
    (sum, p) => sum + (p.total_amount || 0),
    0
  )

  function getMarketName(id: string | null) {
    if (!id) return null
    return supermarkets.find((s) => s.id === id)?.name
  }

  function getMarketColor(id: string | null) {
    if (!id) return "#6366f1"
    return supermarkets.find((s) => s.id === id)?.color || "#6366f1"
  }

  function getMarketInitials(id: string | null) {
    if (!id) return "?"
    const sm = supermarkets.find((s) => s.id === id)
    return sm?.initials || sm?.name.substring(0, 2).toUpperCase() || "?"
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Relatórios"
        description={`${purchases.length} compra${purchases.length !== 1 ? "s" : ""} registrada${purchases.length !== 1 ? "s" : ""}`}
        action={
          <Button
            onClick={() => setReceiptOpen(true)}
            className="touch-target rounded-xl px-4 py-3 text-sm font-bold"
          >
            <Plus className="size-5" />
            Registrar
          </Button>
        }
      />

      {/* Resumo */}
      {purchases.length > 0 && (
        <div className="grid grid-cols-2 gap-3 px-4">
          <Card>
            <CardContent className="text-center py-4">
              <p className="text-2xl font-bold text-primary">
                {purchases.length}
              </p>
              <p className="text-sm text-muted-foreground">Compras</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <p className="text-2xl font-bold text-success">
                {totalSpent > 0 ? formatCurrency(totalSpent) : "—"}
              </p>
              <p className="text-sm text-muted-foreground">Total gasto</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de compras */}
      <div className="flex flex-col gap-3 px-4 pb-4">
        {sorted.map((purchase) => {
          const items = purchaseItems.filter(
            (i) => i.purchase_id === purchase.id
          )
          const marketName = getMarketName(purchase.supermarket_id)
          const isExpanded = expandedId === purchase.id

          return (
            <Card key={purchase.id}>
              <CardContent className="flex flex-col gap-2">
                <button
                  className="flex items-center gap-3 text-left w-full"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : purchase.id)
                  }
                >
                  <div
                    className="flex size-12 shrink-0 items-center justify-center rounded-xl text-white font-bold text-xs"
                    style={{
                      backgroundColor: getMarketColor(purchase.supermarket_id),
                    }}
                  >
                    {purchase.supermarket_id ? (
                      getMarketInitials(purchase.supermarket_id)
                    ) : (
                      <ShoppingBag className="size-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg truncate">
                      {marketName || "Compra"}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-3.5" />
                      {formatDate(purchase.purchase_date)}
                      <span>·</span>
                      <span>{purchase.items_count} itens</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {purchase.total_amount ? (
                      <p className="font-bold text-lg">
                        {formatCurrency(purchase.total_amount)}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sem valor</p>
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-1 border-t pt-3">
                    <div className="flex flex-col gap-1.5">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="truncate flex-1">
                            {item.product_name}
                          </span>
                          <span className="text-muted-foreground shrink-0 ml-2">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => removePurchase(purchase.id)}
                      >
                        <Trash2 className="size-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        {purchases.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-lg font-semibold">Nenhuma compra registrada</p>
            <p className="text-muted-foreground mb-4">
              Finalize uma lista ou registre uma compra manualmente.
            </p>
            <Button
              onClick={() => setReceiptOpen(true)}
              className="h-14 rounded-xl text-lg font-bold px-6 touch-target"
            >
              <Plus className="size-5 mr-2" />
              Registrar Compra
            </Button>
          </div>
        )}
      </div>

      <ReceiptUpload open={receiptOpen} onOpenChange={setReceiptOpen} />
    </div>
  )
}

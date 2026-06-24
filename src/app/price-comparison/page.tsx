"use client"

import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { usePurchaseStore } from "@/store/usePurchaseStore"
import { useProductStore } from "@/store/useProductStore"
import { formatCurrency } from "@/lib/utils"

export default function PriceComparisonPage() {
  const purchases = usePurchaseStore((s) => s.purchases)
  const supermarkets = useProductStore((s) => s.supermarkets)

  const marketsWithPurchases = supermarkets
    .map((sm) => {
      const smPurchases = purchases.filter(
        (p) => p.supermarket_id === sm.id
      )
      const totalSpent = smPurchases.reduce(
        (sum, p) => sum + (p.total_amount || 0),
        0
      )
      const totalItems = smPurchases.reduce(
        (sum, p) => sum + p.items_count,
        0
      )
      return {
        ...sm,
        purchaseCount: smPurchases.length,
        totalSpent,
        totalItems,
        avgPerPurchase:
          smPurchases.length > 0 ? totalSpent / smPurchases.length : 0,
      }
    })
    .filter((sm) => sm.purchaseCount > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Comparar Preços"
        description="Veja onde você gasta mais e menos"
      />

      {marketsWithPurchases.length > 0 ? (
        <div className="flex flex-col gap-3 px-4 pb-4">
          {marketsWithPurchases.map((sm, idx) => (
            <Card key={sm.id}>
              <CardContent className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className="flex size-14 shrink-0 items-center justify-center rounded-xl text-white font-bold text-sm"
                    style={{ backgroundColor: sm.color || "#6366f1" }}
                  >
                    {sm.initials || sm.name.substring(0, 2).toUpperCase()}
                  </div>
                  {idx === 0 && marketsWithPurchases.length > 1 && (
                    <span className="absolute -top-1.5 -right-1.5 text-lg">🏆</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg truncate">{sm.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {sm.purchaseCount} compra{sm.purchaseCount !== 1 ? "s" : ""}
                    {" · "}
                    {sm.totalItems} itens
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-lg">
                    {formatCurrency(sm.totalSpent)}
                  </p>
                  {sm.avgPerPurchase > 0 && (
                    <p className="text-xs text-muted-foreground">
                      ~{formatCurrency(sm.avgPerPurchase)}/compra
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="px-4 py-12 text-center">
          <div className="text-5xl mb-4">💰</div>
          <p className="text-lg font-semibold">Sem dados ainda</p>
          <p className="text-muted-foreground">
            Ao finalizar compras e informar o mercado e valor, a comparação aparecerá aqui.
          </p>
        </div>
      )}
    </div>
  )
}

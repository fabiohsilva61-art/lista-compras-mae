"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
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
import { usePurchaseStore } from "@/store/usePurchaseStore"
import type { ShoppingListItem } from "@/types/database"

interface FinalizePurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: ShoppingListItem[]
  onConfirm: () => void
}

export function FinalizePurchaseDialog({
  open,
  onOpenChange,
  items,
  onConfirm,
}: FinalizePurchaseDialogProps) {
  const supermarkets = useProductStore((s) => s.supermarkets)
  const addPurchase = usePurchaseStore((s) => s.addPurchase)
  const [supermarketId, setSupermarketId] = useState("")
  const [totalAmount, setTotalAmount] = useState("")

  function handleFinalize() {
    const purchaseId = crypto.randomUUID()
    const now = new Date().toISOString()
    const total = parseFloat(totalAmount.replace(",", ".")) || 0

    addPurchase(
      {
        id: purchaseId,
        supermarket_id: supermarketId || null,
        total_amount: total > 0 ? total : null,
        items_count: items.length,
        purchase_date: now.split("T")[0],
        receipt_url: null,
        notes: null,
        created_at: now,
      },
      items.map((item) => ({
        id: crypto.randomUUID(),
        purchase_id: purchaseId,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: 0,
        total_price: 0,
        created_at: now,
      }))
    )

    setSupermarketId("")
    setTotalAmount("")
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <ShoppingCart className="size-6 text-success" />
            Finalizar Compra
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div className="rounded-xl bg-success/10 p-4 text-center">
            <p className="text-3xl font-bold text-success">{items.length}</p>
            <p className="text-sm text-muted-foreground">
              {items.length === 1 ? "item comprado" : "itens comprados"}
            </p>
          </div>

          <div>
            <Label className="text-base font-semibold mb-2 block">
              Onde você comprou? (opcional)
            </Label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {supermarkets.map((sm) => (
                <button
                  key={sm.id}
                  onClick={() =>
                    setSupermarketId(supermarketId === sm.id ? "" : sm.id)
                  }
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors touch-target ${
                    supermarketId === sm.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span
                    className="flex size-6 items-center justify-center rounded text-[0.6rem] font-bold text-white"
                    style={{ backgroundColor: sm.color || "#6366f1" }}
                  >
                    {(sm.initials || sm.name.substring(0, 2)).substring(0, 2)}
                  </span>
                  {sm.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-2 block">
              Valor total (opcional)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground font-semibold">
                R$
              </span>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="h-14 rounded-xl text-lg pl-12"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-1">
            <DialogClose
              render={
                <Button
                  variant="outline"
                  className="flex-1 h-14 rounded-xl text-lg font-bold"
                />
              }
            >
              Voltar
            </DialogClose>
            <Button
              onClick={handleFinalize}
              className="flex-1 h-14 rounded-xl text-lg font-bold bg-success text-success-foreground"
            >
              Concluir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState, useRef } from "react"
import { Camera, Upload, FileText, Loader2, AlertCircle } from "lucide-react"
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
import { useProductStore } from "@/store/useProductStore"
import { usePurchaseStore } from "@/store/usePurchaseStore"

interface ReceiptItem {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface ReceiptUploadProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReceiptUpload({ open, onOpenChange }: ReceiptUploadProps) {
  const supermarkets = useProductStore((s) => s.supermarkets)
  const addPurchase = usePurchaseStore((s) => s.addPurchase)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<"upload" | "review" | "manual">("upload")
  const [receiptImage, setReceiptImage] = useState<string | null>(null)
  const [items, setItems] = useState<ReceiptItem[]>([])
  const [supermarketId, setSupermarketId] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  )

  // Manual entry fields
  const [manualName, setManualName] = useState("")
  const [manualQty, setManualQty] = useState("1")
  const [manualPrice, setManualPrice] = useState("")

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      setReceiptImage(ev.target?.result as string)
      setStep("manual")
    }
    reader.readAsDataURL(file)
  }

  function addManualItem() {
    if (!manualName.trim() || !manualPrice.trim()) return
    const price = parseFloat(manualPrice.replace(",", ".")) || 0
    const qty = parseFloat(manualQty.replace(",", ".")) || 1

    setItems([
      ...items,
      {
        name: manualName.trim(),
        quantity: qty,
        unitPrice: price,
        totalPrice: price * qty,
      },
    ])
    setManualName("")
    setManualQty("1")
    setManualPrice("")
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function handleSave() {
    const purchaseId = crypto.randomUUID()
    const now = new Date().toISOString()
    const total =
      parseFloat(totalAmount.replace(",", ".")) ||
      items.reduce((s, i) => s + i.totalPrice, 0)

    addPurchase(
      {
        id: purchaseId,
        supermarket_id: supermarketId || null,
        total_amount: total > 0 ? total : null,
        items_count: items.length,
        purchase_date: purchaseDate,
        receipt_url: receiptImage,
        notes: null,
        created_at: now,
      },
      items.map((item) => ({
        id: crypto.randomUUID(),
        purchase_id: purchaseId,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        created_at: now,
      }))
    )

    handleClose()
  }

  function handleClose() {
    setStep("upload")
    setReceiptImage(null)
    setItems([])
    setSupermarketId("")
    setTotalAmount("")
    setManualName("")
    setManualQty("1")
    setManualPrice("")
    onOpenChange(false)
  }

  const itemsTotal = items.reduce((s, i) => s + i.totalPrice, 0)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="size-6 text-primary" />
            {step === "upload" ? "Registrar Compra" : "Itens da Compra"}
          </DialogTitle>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {step === "upload" && (
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="h-28 rounded-xl text-lg font-bold flex-col gap-2"
            >
              <Camera className="size-8" />
              Fotografar Cupom Fiscal
            </Button>

            <Button
              onClick={() => setStep("manual")}
              variant="outline"
              className="h-14 rounded-xl text-lg font-bold"
            >
              <FileText className="size-5 mr-2" />
              Digitar Manualmente
            </Button>

            <div className="rounded-xl bg-muted/50 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  O reconhecimento automático de cupom (OCR) será ativado quando
                  uma chave de API for configurada. Por enquanto, digite os itens manualmente.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === "manual" && (
          <div className="flex flex-col gap-4">
            {/* Foto do cupom (se houver) */}
            {receiptImage && (
              <div className="rounded-xl overflow-hidden bg-muted max-h-32">
                <img
                  src={receiptImage}
                  alt="Cupom"
                  className="w-full h-auto max-h-32 object-contain"
                />
              </div>
            )}

            {/* Supermercado e data */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold mb-1 block">Data</Label>
                <Input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-1 block">
                  Total (R$)
                </Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-1 block">Mercado</Label>
              <div className="flex flex-wrap gap-1.5">
                {supermarkets.slice(0, 8).map((sm) => (
                  <button
                    key={sm.id}
                    onClick={() =>
                      setSupermarketId(supermarketId === sm.id ? "" : sm.id)
                    }
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      supermarketId === sm.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {sm.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Adicionar item */}
            <div className="border rounded-xl p-3">
              <p className="text-sm font-semibold mb-2">Adicionar item</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Produto"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="h-11 rounded-lg flex-1"
                />
                <Input
                  placeholder="Qtd"
                  inputMode="decimal"
                  value={manualQty}
                  onChange={(e) => setManualQty(e.target.value)}
                  className="h-11 rounded-lg w-14 text-center"
                />
                <Input
                  placeholder="R$"
                  inputMode="decimal"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  className="h-11 rounded-lg w-20"
                />
                <Button
                  onClick={addManualItem}
                  disabled={!manualName.trim() || !manualPrice.trim()}
                  size="icon"
                  className="size-11 rounded-lg shrink-0"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Lista de itens */}
            {items.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
                  >
                    <span className="truncate flex-1">{item.name}</span>
                    <span className="text-muted-foreground mx-2">
                      x{item.quantity}
                    </span>
                    <span className="font-semibold">
                      R$ {item.totalPrice.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(idx)}
                      className="ml-2 text-destructive text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 p-3 mt-1">
                  <span className="font-bold">
                    {items.length} {items.length === 1 ? "item" : "itens"}
                  </span>
                  <span className="font-bold text-lg text-primary">
                    R$ {itemsTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-3">
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
                onClick={handleSave}
                disabled={items.length === 0}
                className="flex-1 h-14 rounded-xl text-lg font-bold"
              >
                Salvar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

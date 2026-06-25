"use client"

import { useState, useRef } from "react"
import { Camera, FileText, Loader2, Plus, Trash2, Sparkles } from "lucide-react"
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
import { processReceipt, type OcrReceiptItem } from "@/lib/ocr"

interface ReceiptUploadProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReceiptUpload({ open, onOpenChange }: ReceiptUploadProps) {
  const supermarkets = useProductStore((s) => s.supermarkets)
  const addPurchase = usePurchaseStore((s) => s.addPurchase)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<"upload" | "processing" | "review">("upload")
  const [receiptImage, setReceiptImage] = useState<string | null>(null)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [items, setItems] = useState<OcrReceiptItem[]>([])
  const [supermarketId, setSupermarketId] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [detectedMarket, setDetectedMarket] = useState<string | null>(null)

  const [manualName, setManualName] = useState("")
  const [manualQty, setManualQty] = useState("1")
  const [manualPrice, setManualPrice] = useState("")

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      setReceiptImage(dataUrl)
      setStep("processing")
      setOcrProgress(0)

      try {
        const result = await processReceipt(dataUrl, setOcrProgress)
        setItems(result.items)
        if (result.total) {
          setTotalAmount(result.total.toFixed(2).replace(".", ","))
        }
        if (result.supermarket) {
          setDetectedMarket(result.supermarket)
          const match = supermarkets.find((sm) =>
            sm.name.toLowerCase().includes(result.supermarket!.toLowerCase()) ||
            result.supermarket!.toLowerCase().includes(sm.name.toLowerCase())
          )
          if (match) setSupermarketId(match.id)
        }
      } catch {
        // OCR failed, let user enter manually
      }
      setStep("review")
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

  function updateItem(index: number, field: keyof OcrReceiptItem, value: string) {
    setItems(items.map((item, i) => {
      if (i !== index) return item
      if (field === "name") return { ...item, name: value }
      const num = parseFloat(value.replace(",", ".")) || 0
      if (field === "quantity") return { ...item, quantity: num, totalPrice: num * item.unitPrice }
      if (field === "unitPrice") return { ...item, unitPrice: num, totalPrice: item.quantity * num }
      if (field === "totalPrice") return { ...item, totalPrice: num }
      return item
    }))
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
        receipt_url: null,
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
    setDetectedMarket(null)
    setOcrProgress(0)
    onOpenChange(false)
  }

  const itemsTotal = items.reduce((s, i) => s + i.totalPrice, 0)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="size-6 text-primary" />
            Registrar Compra
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

        {/* STEP: Upload */}
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
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute("capture")
                  fileInputRef.current.click()
                  fileInputRef.current.setAttribute("capture", "environment")
                }
              }}
              variant="outline"
              className="h-14 rounded-xl text-lg font-bold"
            >
              <FileText className="size-5 mr-2" />
              Escolher Imagem da Galeria
            </Button>

            <Button
              onClick={() => setStep("review")}
              variant="outline"
              className="h-14 rounded-xl text-lg font-bold"
            >
              <Plus className="size-5 mr-2" />
              Digitar Manualmente
            </Button>

            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">OCR automático ativado!</strong>{" "}
                  Tire uma foto do cupom fiscal e o sistema vai ler os itens e preços automaticamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP: Processing OCR */}
        {step === "processing" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="size-12 text-primary animate-spin" />
            <div className="text-center">
              <p className="text-lg font-bold">Lendo cupom fiscal...</p>
              <p className="text-muted-foreground">Isso pode levar alguns segundos</p>
            </div>
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${ocrProgress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{ocrProgress}%</p>
          </div>
        )}

        {/* STEP: Review */}
        {step === "review" && (
          <div className="flex flex-col gap-4">
            {/* Receipt preview */}
            {receiptImage && (
              <div className="rounded-xl overflow-hidden bg-muted max-h-32">
                <img
                  src={receiptImage}
                  alt="Cupom"
                  className="w-full h-auto max-h-32 object-contain"
                />
              </div>
            )}

            {/* OCR result badge */}
            {items.length > 0 && receiptImage && (
              <div className="rounded-xl bg-success/10 border border-success/30 p-3 flex items-center gap-2">
                <Sparkles className="size-5 text-success" />
                <p className="text-sm font-medium">
                  {items.length} {items.length === 1 ? "item encontrado" : "itens encontrados"} pelo OCR
                  {detectedMarket && ` · Mercado: ${detectedMarket}`}
                </p>
              </div>
            )}

            {/* Date + Total */}
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
                <Label className="text-sm font-semibold mb-1 block">Total (R$)</Label>
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

            {/* Supermarket */}
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

            {/* Items list (editable) */}
            {items.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-semibold">Itens</p>
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2 py-1.5"
                  >
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(idx, "name", e.target.value)}
                      className="h-9 rounded-lg flex-1 text-sm min-w-0"
                    />
                    <Input
                      value={item.quantity.toString()}
                      onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                      inputMode="decimal"
                      className="h-9 rounded-lg w-12 text-center text-sm"
                    />
                    <Input
                      value={item.unitPrice.toFixed(2)}
                      onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                      inputMode="decimal"
                      className="h-9 rounded-lg w-20 text-sm"
                    />
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-destructive shrink-0 p-1"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add manual item */}
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

            {/* Totals */}
            {items.length > 0 && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold">
                    {items.length} {items.length === 1 ? "item" : "itens"}
                  </span>
                  <span className="font-bold text-lg text-primary">
                    R$ {itemsTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
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

"use client"

import { useRef, useState } from "react"
import { Camera, Upload, X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PhotoCaptureProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapture: (dataUrl: string) => void
  title?: string
}

export function PhotoCapture({
  open,
  onOpenChange,
  onCapture,
  title = "Tirar Foto",
}: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }

  function processFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string

      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const maxSize = 400
        let w = img.width
        let h = img.height

        if (w > h) {
          if (w > maxSize) { h = (h * maxSize) / w; w = maxSize }
        } else {
          if (h > maxSize) { w = (w * maxSize) / h; h = maxSize }
        }

        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")!
        ctx.drawImage(img, 0, 0, w, h)
        const compressed = canvas.toDataURL("image/jpeg", 0.7)
        setPreview(compressed)
      }
      img.src = result
    }
    reader.readAsDataURL(file)
  }

  function handleConfirm() {
    if (preview) {
      onCapture(preview)
      setPreview(null)
      onOpenChange(false)
    }
  }

  function handleReset() {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleClose() {
    setPreview(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {preview ? (
          <div className="flex flex-col gap-3">
            <div className="relative rounded-xl overflow-hidden bg-muted">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-auto max-h-64 object-contain mx-auto"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 h-14 rounded-xl text-lg font-bold"
              >
                <RotateCcw className="size-5 mr-2" />
                Refazer
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 h-14 rounded-xl text-lg font-bold"
              >
                Usar Foto
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="h-32 rounded-xl text-lg font-bold flex-col gap-2"
            >
              <Camera className="size-10" />
              Tirar Foto
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
              <Upload className="size-5 mr-2" />
              Escolher da Galeria
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

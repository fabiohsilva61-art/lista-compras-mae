"use client"

import Tesseract from "tesseract.js"

export interface OcrReceiptItem {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface OcrResult {
  rawText: string
  items: OcrReceiptItem[]
  total: number | null
  supermarket: string | null
}

export async function processReceipt(
  imageSource: string | File,
  onProgress?: (progress: number) => void
): Promise<OcrResult> {
  const result = await Tesseract.recognize(imageSource, "por", {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round(m.progress * 100))
      }
    },
  })

  const rawText = result.data.text
  return parseReceiptText(rawText)
}

function parseReceiptText(rawText: string): OcrResult {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2)

  const items: OcrReceiptItem[] = []
  let total: number | null = null
  let supermarket: string | null = null

  // First non-empty lines often contain the store name
  for (const line of lines.slice(0, 5)) {
    const cleaned = line.replace(/[^a-zA-ZÀ-ÿ\s]/g, "").trim()
    if (cleaned.length > 3 && !cleaned.match(/cnpj|cpf|end|rua|av\.|tel/i)) {
      supermarket = cleaned
      break
    }
  }

  for (const line of lines) {
    // Match total line: "TOTAL" or "VALOR TOTAL" followed by a price
    const totalMatch = line.match(
      /(?:TOTAL|VL\s*TOTAL|VALOR\s*TOTAL)\s*R?\$?\s*(\d+[.,]\d{2})/i
    )
    if (totalMatch) {
      total = parsePrice(totalMatch[1])
      continue
    }

    // Try to extract product lines
    // Pattern 1: "PRODUCT NAME    1 x 5,99    5,99" or "PRODUCT NAME    5,99"
    const itemMatch = line.match(
      /^(.+?)\s+(\d+)\s*[xX*]\s*(\d+[.,]\d{2})\s+(\d+[.,]\d{2})/
    )
    if (itemMatch) {
      items.push({
        name: cleanProductName(itemMatch[1]),
        quantity: parseInt(itemMatch[2]),
        unitPrice: parsePrice(itemMatch[3]),
        totalPrice: parsePrice(itemMatch[4]),
      })
      continue
    }

    // Pattern 2: "PRODUCT NAME    5,99" (single price at end)
    const simpleMatch = line.match(
      /^(.{3,}?)\s{2,}(\d+[.,]\d{2})\s*$/
    )
    if (simpleMatch) {
      const name = cleanProductName(simpleMatch[1])
      const price = parsePrice(simpleMatch[2])
      if (name.length > 1 && price > 0 && price < 5000) {
        items.push({
          name,
          quantity: 1,
          unitPrice: price,
          totalPrice: price,
        })
      }
      continue
    }

    // Pattern 3: price somewhere in the line with product name
    const anyPriceMatch = line.match(
      /^(.{3,}?)\s+R?\$?\s*(\d+[.,]\d{2})/
    )
    if (anyPriceMatch) {
      const name = cleanProductName(anyPriceMatch[1])
      const price = parsePrice(anyPriceMatch[2])
      const isHeader = /item|desc|prod|qtd|val|cod|un\b/i.test(name)
      const isFooter = /total|troco|dinheiro|cart|cred|deb|pix|cpf|cnpj/i.test(name)

      if (name.length > 1 && price > 0 && price < 5000 && !isHeader && !isFooter) {
        items.push({
          name,
          quantity: 1,
          unitPrice: price,
          totalPrice: price,
        })
      }
    }
  }

  return { rawText, items, total, supermarket }
}

function parsePrice(str: string): number {
  return parseFloat(str.replace(",", ".")) || 0
}

function cleanProductName(name: string): string {
  return name
    .replace(/^\d+\s+/, "")       // remove leading numbers (code)
    .replace(/\d{3,}/g, "")       // remove long number sequences
    .replace(/[*#]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Purchase, PurchaseItem } from "@/types/database"

interface PurchaseState {
  purchases: Purchase[]
  purchaseItems: PurchaseItem[]

  addPurchase: (purchase: Purchase, items: PurchaseItem[]) => void
  removePurchase: (id: string) => void

  getPurchaseItems: (purchaseId: string) => PurchaseItem[]
  getTotalSpent: () => number
  getRecentPurchases: (limit?: number) => Purchase[]
}

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set, get) => ({
      purchases: [],
      purchaseItems: [],

      addPurchase: (purchase, items) =>
        set((state) => ({
          purchases: [purchase, ...state.purchases],
          purchaseItems: [...state.purchaseItems, ...items],
        })),

      removePurchase: (id) =>
        set((state) => ({
          purchases: state.purchases.filter((p) => p.id !== id),
          purchaseItems: state.purchaseItems.filter((i) => i.purchase_id !== id),
        })),

      getPurchaseItems: (purchaseId) => {
        return get().purchaseItems.filter((i) => i.purchase_id === purchaseId)
      },

      getTotalSpent: () => {
        return get().purchases.reduce(
          (sum, p) => sum + (p.total_amount || 0),
          0
        )
      },

      getRecentPurchases: (limit = 10) => {
        return [...get().purchases]
          .sort(
            (a, b) =>
              new Date(b.purchase_date).getTime() -
              new Date(a.purchase_date).getTime()
          )
          .slice(0, limit)
      },
    }),
    {
      name: "purchase-storage",
    }
  )
)

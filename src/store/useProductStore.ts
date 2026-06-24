"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product, Category, Supermarket } from "@/types/database"
import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS, DEFAULT_SUPERMARKETS } from "@/lib/seed-data"

const SEED_VERSION = 2

interface ProductState {
  products: Product[]
  categories: Category[]
  supermarkets: Supermarket[]
  initialized: boolean
  seedVersion?: number

  initialize: () => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, data: Partial<Product>) => void
  removeProduct: (id: string) => void
  setProducts: (products: Product[]) => void

  addCategory: (category: Category) => void
  setCategories: (categories: Category[]) => void

  addSupermarket: (supermarket: Supermarket) => void
  updateSupermarket: (id: string, data: Partial<Supermarket>) => void
  removeSupermarket: (id: string) => void
  setSupermarkets: (supermarkets: Supermarket[]) => void
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],
      categories: [],
      supermarkets: [],
      initialized: false,

      initialize: () => {
        if (get().initialized && get().seedVersion === SEED_VERSION) return
        set({
          categories: DEFAULT_CATEGORIES,
          products: DEFAULT_PRODUCTS,
          supermarkets: DEFAULT_SUPERMARKETS,
          initialized: true,
          seedVersion: SEED_VERSION,
        })
      },

      addProduct: (product) =>
        set((state) => ({ products: [...state.products, product] })),

      updateProduct: (id, data) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      setProducts: (products) => set({ products }),

      addCategory: (category) =>
        set((state) => ({ categories: [...state.categories, category] })),

      setCategories: (categories) => set({ categories }),

      addSupermarket: (supermarket) =>
        set((state) => ({ supermarkets: [...state.supermarkets, supermarket] })),

      updateSupermarket: (id, data) =>
        set((state) => ({
          supermarkets: state.supermarkets.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        })),

      removeSupermarket: (id) =>
        set((state) => ({
          supermarkets: state.supermarkets.filter((s) => s.id !== id),
        })),

      setSupermarkets: (supermarkets) => set({ supermarkets }),
    }),
    {
      name: "product-storage",
    }
  )
)

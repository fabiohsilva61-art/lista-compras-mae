"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ShoppingList, ShoppingListItem } from "@/types/database"

interface ShoppingListState {
  lists: ShoppingList[]
  items: ShoppingListItem[]

  createList: (list: ShoppingList) => void
  removeList: (id: string) => void
  completeList: (id: string) => void

  addItemToList: (productId: string | null, productName: string, quantity?: number) => void
  removeItem: (id: string) => void
  toggleItem: (id: string) => void
  updateItemQuantity: (id: string, quantity: number) => void

  getActiveList: () => ShoppingList | undefined
  getActiveItems: () => ShoppingListItem[]
  isProductInActiveList: (productId: string) => boolean

  setLists: (lists: ShoppingList[]) => void
  setItems: (items: ShoppingListItem[]) => void
}

function ensureActiveList(state: { lists: ShoppingList[] }): ShoppingList {
  const active = state.lists.find((l) => l.status === "active")
  if (active) return active

  const newList: ShoppingList = {
    id: crypto.randomUUID(),
    name: "Lista de Compras",
    status: "active",
    created_at: new Date().toISOString(),
    completed_at: null,
  }
  state.lists.push(newList)
  return newList
}

export const useShoppingListStore = create<ShoppingListState>()(
  persist(
    (set, get) => ({
      lists: [],
      items: [],

      createList: (list) =>
        set((state) => ({ lists: [...state.lists, list] })),

      removeList: (id) =>
        set((state) => ({
          lists: state.lists.filter((l) => l.id !== id),
          items: state.items.filter((i) => i.shopping_list_id !== id),
        })),

      completeList: (id) =>
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === id
              ? { ...l, status: "completed" as const, completed_at: new Date().toISOString() }
              : l
          ),
        })),

      addItemToList: (productId, productName, quantity = 1) => {
        const state = get()
        const lists = [...state.lists]
        const activeList = ensureActiveList({ lists })

        if (productId && state.items.some(
          (i) => i.shopping_list_id === activeList.id && i.product_id === productId && !i.is_checked
        )) {
          return
        }

        const newItem: ShoppingListItem = {
          id: crypto.randomUUID(),
          shopping_list_id: activeList.id,
          product_id: productId,
          product_name: productName,
          quantity,
          is_checked: false,
          created_at: new Date().toISOString(),
        }

        set({ lists, items: [...state.items, newItem] })
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      toggleItem: (id) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, is_checked: !i.is_checked } : i
          ),
        })),

      updateItemQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        })),

      getActiveList: () => {
        return get().lists.find((l) => l.status === "active")
      },

      getActiveItems: () => {
        const activeList = get().lists.find((l) => l.status === "active")
        if (!activeList) return []
        return get().items.filter((i) => i.shopping_list_id === activeList.id)
      },

      isProductInActiveList: (productId) => {
        const activeList = get().lists.find((l) => l.status === "active")
        if (!activeList) return false
        return get().items.some(
          (i) => i.shopping_list_id === activeList.id && i.product_id === productId && !i.is_checked
        )
      },

      setLists: (lists) => set({ lists }),
      setItems: (items) => set({ items }),
    }),
    {
      name: "shopping-list-storage",
    }
  )
)

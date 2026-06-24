"use client"

import { isSupabaseConfigured } from "@/lib/supabase"
import type {
  Product,
  ShoppingList,
  ShoppingListItem,
  Purchase,
  PurchaseItem,
  Supermarket,
} from "@/types/database"

async function getClient() {
  if (!isSupabaseConfigured) return null
  const { getSupabase } = await import("@/lib/supabase")
  try {
    return getSupabase()
  } catch {
    return null
  }
}

// ─── PRODUCTS ────────────────────────────────────────

export async function syncProduct(product: Product) {
  const sb = await getClient()
  if (!sb) return
  await sb.from("products").upsert({
    id: product.id,
    name: product.name,
    photo_url: product.photo_url,
    category_id: product.category_id,
  }, { onConflict: "id" })
}

export async function deleteProductFromDB(id: string) {
  const sb = await getClient()
  if (!sb) return
  await sb.from("products").delete().eq("id", id)
}

// ─── SUPERMARKETS ────────────────────────────────────

export async function syncSupermarket(sm: Supermarket) {
  const sb = await getClient()
  if (!sb) return
  await sb.from("supermarkets").upsert({
    id: sm.id,
    name: sm.name,
    city: sm.city,
    notes: sm.notes,
  }, { onConflict: "id" })
}

export async function deleteSupermarketFromDB(id: string) {
  const sb = await getClient()
  if (!sb) return
  await sb.from("supermarkets").delete().eq("id", id)
}

// ─── SHOPPING LISTS ──────────────────────────────────

export async function syncShoppingList(list: ShoppingList) {
  const sb = await getClient()
  if (!sb) return
  await sb.from("shopping_lists").upsert({
    id: list.id,
    name: list.name,
    status: list.status,
    created_at: list.created_at,
    completed_at: list.completed_at,
  }, { onConflict: "id" })
}

export async function deleteShoppingListFromDB(id: string) {
  const sb = await getClient()
  if (!sb) return
  await sb.from("shopping_list_items").delete().eq("shopping_list_id", id)
  await sb.from("shopping_lists").delete().eq("id", id)
}

export async function syncShoppingListItem(item: ShoppingListItem) {
  const sb = await getClient()
  if (!sb) return
  await sb.from("shopping_list_items").upsert({
    id: item.id,
    shopping_list_id: item.shopping_list_id,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    is_checked: item.is_checked,
  }, { onConflict: "id" })
}

export async function deleteShoppingListItemFromDB(id: string) {
  const sb = await getClient()
  if (!sb) return
  await sb.from("shopping_list_items").delete().eq("id", id)
}

// ─── PURCHASES ───────────────────────────────────────

export async function syncPurchase(purchase: Purchase, items: PurchaseItem[]) {
  const sb = await getClient()
  if (!sb) return
  await sb.from("purchases").upsert({
    id: purchase.id,
    supermarket_id: purchase.supermarket_id,
    total_amount: purchase.total_amount,
    items_count: purchase.items_count,
    purchase_date: purchase.purchase_date,
    receipt_url: purchase.receipt_url,
    notes: purchase.notes,
  }, { onConflict: "id" })

  if (items.length > 0) {
    await sb.from("purchase_items").upsert(
      items.map((i) => ({
        id: i.id,
        purchase_id: i.purchase_id,
        product_name: i.product_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: i.total_price,
      })),
      { onConflict: "id" }
    )
  }
}

export async function deletePurchaseFromDB(id: string) {
  const sb = await getClient()
  if (!sb) return
  await sb.from("purchase_items").delete().eq("purchase_id", id)
  await sb.from("purchases").delete().eq("id", id)
}

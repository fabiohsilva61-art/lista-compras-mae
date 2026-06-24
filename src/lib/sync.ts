import { getSupabase, isSupabaseConfigured } from "@/lib/supabase"
import type { Product, Category, Supermarket, ShoppingList, ShoppingListItem } from "@/types/database"

export async function syncProductsToSupabase(products: Product[]) {
  if (!isSupabaseConfigured) return

  const { error } = await getSupabase()
    .from("products")
    .upsert(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        photo_url: p.photo_url,
        category_id: p.category_id,
      })),
      { onConflict: "id" }
    )

  if (error) console.error("Sync products error:", error)
}

export async function syncShoppingListToSupabase(
  list: ShoppingList,
  items: ShoppingListItem[]
) {
  if (!isSupabaseConfigured) return

  const { error: listError } = await getSupabase()
    .from("shopping_lists")
    .upsert(list, { onConflict: "id" })

  if (listError) {
    console.error("Sync list error:", listError)
    return
  }

  const { error: itemsError } = await getSupabase()
    .from("shopping_list_items")
    .upsert(items, { onConflict: "id" })

  if (itemsError) console.error("Sync items error:", itemsError)
}

export async function fetchProductsFromSupabase(): Promise<Product[]> {
  if (!isSupabaseConfigured) return []

  const { data, error } = await getSupabase()
    .from("products")
    .select("*")
    .order("name")

  if (error) {
    console.error("Fetch products error:", error)
    return []
  }

  return (data ?? []).map((p) => ({
    ...p,
    icon: "📦",
    created_at: p.created_at ?? "",
  }))
}

export async function fetchCategoriesFromSupabase(): Promise<Category[]> {
  if (!isSupabaseConfigured) return []

  const { data, error } = await getSupabase()
    .from("categories")
    .select("*")
    .order("sort_order")

  if (error) {
    console.error("Fetch categories error:", error)
    return []
  }

  return data ?? []
}

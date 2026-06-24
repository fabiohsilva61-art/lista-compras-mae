export interface Category {
  id: string
  name: string
  icon: string | null
  sort_order: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  icon: string
  photo_url: string | null
  category_id: string | null
  created_at: string
}

export interface SupermarketSeed {
  id: string
  name: string
  city: string
  notes: string | null
  color: string
  initials: string
  created_at: string
}

export interface Supermarket {
  id: string
  name: string
  city: string | null
  notes: string | null
  color?: string
  initials?: string
  created_at: string
}

export interface ShoppingList {
  id: string
  name: string
  status: "active" | "completed" | "cancelled"
  created_at: string
  completed_at: string | null
}

export interface ShoppingListItem {
  id: string
  shopping_list_id: string
  product_id: string | null
  product_name: string
  quantity: number
  is_checked: boolean
  created_at: string
}

export interface Purchase {
  id: string
  supermarket_id: string | null
  total_amount: number | null
  items_count: number
  purchase_date: string
  receipt_url: string | null
  notes: string | null
  created_at: string
}

export interface PurchaseItem {
  id: string
  purchase_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface PriceHistory {
  id: string
  product_id: string
  supermarket_id: string
  price: number
  date: string
  created_at: string
}

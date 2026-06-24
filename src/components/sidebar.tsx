"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Package,
  ShoppingCart,
  Store,
  BarChart3,
  FileText,
  Settings,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useShoppingListStore } from "@/store/useShoppingListStore"

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/products", label: "Produtos", icon: Package },
  { href: "/shopping-list", label: "Lista de Compras", icon: ShoppingCart },
  { href: "/supermarkets", label: "Supermercados", icon: Store },
  { href: "/price-comparison", label: "Comparar Preços", icon: BarChart3 },
  { href: "/purchases", label: "Relatórios", icon: FileText },
  { href: "/settings", label: "Configurações", icon: Settings },
]

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const uncheckedCount = useShoppingListStore((s) => {
    const activeList = s.lists.find((l) => l.status === "active")
    if (!activeList) return 0
    return s.items.filter((i) => i.shopping_list_id === activeList.id && !i.is_checked).length
  })

  return (
    <div className="flex flex-col gap-1 p-3">
      <div className="px-3 pb-4 pt-2">
        <h2 className="text-xl font-bold text-primary">🛒 Compras</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Controle doméstico</p>
      </div>

      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        const showBadge = item.href === "/shopping-list" && uncheckedCount > 0

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-4 text-base font-medium transition-colors touch-target",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted active:bg-muted"
            )}
          >
            <Icon className="size-6 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {showBadge && (
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-sm font-bold",
                  isActive
                    ? "bg-primary-foreground text-primary"
                    : "bg-destructive text-white"
                )}
              >
                {uncheckedCount}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:border-r lg:bg-card">
      <NavContent />
    </aside>
  )
}

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex size-12 items-center justify-center rounded-xl touch-target"
          aria-label="Abrir menu"
        >
          <Menu className="size-7" />
        </button>
        <h1 className="text-lg font-bold text-primary">🛒 Compras</h1>
        <div className="size-12" />
      </header>

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-card shadow-xl lg:hidden animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-end p-3">
              <button
                onClick={() => setOpen(false)}
                className="flex size-12 items-center justify-center rounded-xl touch-target"
                aria-label="Fechar menu"
              >
                <X className="size-7" />
              </button>
            </div>
            <NavContent onNavigate={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}

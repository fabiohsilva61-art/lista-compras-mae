"use client"

import { Trash2, RotateCcw, LogIn, LogOut, Cloud, CloudOff, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { useProductStore } from "@/store/useProductStore"
import { useShoppingListStore } from "@/store/useShoppingListStore"
import { useAuth } from "@/lib/auth"
import { isSupabaseConfigured } from "@/lib/supabase"
import Link from "next/link"

export default function SettingsPage() {
  const shoppingListStore = useShoppingListStore()
  const { user, signOut } = useAuth()

  function handleClearList() {
    const activeList = shoppingListStore.getActiveList()
    if (activeList) {
      shoppingListStore.removeList(activeList.id)
    }
  }

  function handleResetProducts() {
    localStorage.removeItem("product-storage")
    window.location.reload()
  }

  function handleResetAll() {
    localStorage.removeItem("product-storage")
    localStorage.removeItem("shopping-list-storage")
    localStorage.removeItem("purchase-storage")
    window.location.reload()
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Configurações"
        description="Gerenciar conta e dados"
      />

      <div className="flex flex-col gap-3 px-4 pb-4">
        {/* Conta */}
        <Card>
          <CardContent>
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              <User className="size-5" />
              Conta
            </h3>
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-sm text-muted-foreground">Logado como</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => signOut()}
                  className="h-12 rounded-xl text-base font-bold w-full touch-target"
                >
                  <LogOut className="size-5 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground mb-2">
                  {isSupabaseConfigured
                    ? "Faça login para sincronizar dados entre dispositivos."
                    : "Modo offline. Dados salvos apenas neste dispositivo."}
                </p>
                {isSupabaseConfigured && (
                  <Link href="/login">
                    <Button className="h-12 rounded-xl text-base font-bold w-full touch-target">
                      <LogIn className="size-5 mr-2" />
                      Fazer Login
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sincronização */}
        <Card>
          <CardContent>
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              {isSupabaseConfigured ? (
                <Cloud className="size-5 text-success" />
              ) : (
                <CloudOff className="size-5 text-muted-foreground" />
              )}
              Sincronização
            </h3>
            <p className="text-sm text-muted-foreground">
              {isSupabaseConfigured
                ? "Conectado ao servidor. Dados podem ser sincronizados."
                : "Sem servidor configurado. Todos os dados estão salvos localmente neste dispositivo."}
            </p>
          </CardContent>
        </Card>

        {/* Dados */}
        <Card>
          <CardContent>
            <h3 className="font-bold text-lg mb-3">Gerenciar Dados</h3>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={handleClearList}
                className="h-12 rounded-xl text-base font-bold w-full touch-target justify-start"
              >
                <Trash2 className="size-5 mr-2" />
                Limpar Lista de Compras
              </Button>
              <Button
                variant="outline"
                onClick={handleResetProducts}
                className="h-12 rounded-xl text-base font-bold w-full touch-target justify-start"
              >
                <RotateCcw className="size-5 mr-2" />
                Restaurar Produtos Originais
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Zona de perigo */}
        <Card className="border-destructive/30">
          <CardContent>
            <h3 className="font-bold text-lg mb-1 text-destructive">Zona de Perigo</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Remove todos os dados salvos no dispositivo.
            </p>
            <Button
              variant="destructive"
              onClick={handleResetAll}
              className="h-12 rounded-xl text-base font-bold w-full touch-target"
            >
              <Trash2 className="size-5 mr-2" />
              Apagar Todos os Dados
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground mt-4">
          <p>Controle de Compras v2.0</p>
          <p className="mt-0.5">
            {isSupabaseConfigured ? "Modo online" : "Modo offline"} · Dados no{" "}
            {isSupabaseConfigured ? "servidor + " : ""}dispositivo
          </p>
        </div>
      </div>
    </div>
  )
}

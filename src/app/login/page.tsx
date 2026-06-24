"use client"

import { useState } from "react"
import { Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { isSupabaseConfigured } from "@/lib/supabase"

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleEmailLogin() {
    if (!email.trim()) return
    setLoading(true)
    setError("")

    const { error } = await signInWithEmail(email)
    setLoading(false)

    if (error) {
      setError("Erro ao enviar link. Tente novamente.")
    } else {
      setSent(true)
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-col gap-4 px-4 py-12 text-center">
        <div className="text-5xl mb-2">🔒</div>
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="text-muted-foreground text-lg">
          Para ativar o login, configure as variáveis do Supabase no arquivo{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm">.env.local</code>
        </p>
        <Card className="mt-4">
          <CardContent className="text-left text-sm font-mono text-muted-foreground">
            <p>NEXT_PUBLIC_SUPABASE_URL=https://...</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4 px-4 py-12 text-center">
        <div className="text-5xl mb-2">✉️</div>
        <h1 className="text-2xl font-bold">Verifique seu e-mail</h1>
        <p className="text-muted-foreground text-lg">
          Enviamos um link mágico para <strong>{email}</strong>. Clique no link
          para entrar.
        </p>
        <Button
          onClick={() => setSent(false)}
          variant="outline"
          className="h-14 rounded-xl text-lg font-bold mt-4 touch-target"
        >
          Tentar outro e-mail
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-12">
      <div className="text-center">
        <div className="text-5xl mb-3">🛒</div>
        <h1 className="text-2xl font-bold">Controle de Compras</h1>
        <p className="text-muted-foreground text-lg mt-1">
          Entre para sincronizar seus dados
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-14 rounded-xl text-lg"
          autoFocus
        />

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button
          onClick={handleEmailLogin}
          disabled={loading || !email.trim()}
          className="h-14 rounded-xl text-lg font-bold touch-target"
        >
          {loading ? (
            <Loader2 className="size-5 mr-2 animate-spin" />
          ) : (
            <Mail className="size-5 mr-2" />
          )}
          Entrar com Link Mágico
        </Button>

        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">ou</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button
          onClick={() => signInWithGoogle()}
          variant="outline"
          className="h-14 rounded-xl text-lg font-bold touch-target"
        >
          <svg className="size-5 mr-2" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Entrar com Google
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Sem senha. Simples e seguro.
      </p>
    </div>
  )
}

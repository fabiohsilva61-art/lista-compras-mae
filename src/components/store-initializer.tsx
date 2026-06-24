"use client"

import { useEffect } from "react"
import { useProductStore } from "@/store/useProductStore"

export function StoreInitializer() {
  const initialize = useProductStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return null
}

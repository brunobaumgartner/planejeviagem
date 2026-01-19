// src/hooks/useAutenticacao.ts
import { useEffect, useState } from 'react'
import { clienteSupabase } from '../lib/supabase'

export function useAutenticacao() {
  const [usuario, setUsuario] = useState<any>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    clienteSupabase.auth.getSession().then(({ data }) => {
      setUsuario(data.session?.user ?? null)
      setCarregando(false)
    })

    const { data: listener } = clienteSupabase.auth.onAuthStateChange(
      (_evento, sessao) => {
        setUsuario(sessao?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return {
    usuario,
    autenticado: !!usuario,
    carregando
  }
}

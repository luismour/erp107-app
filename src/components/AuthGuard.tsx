"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Loader2, Tent } from "lucide-react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/login") {
      router.replace("/login")
    }
  }, [status, pathname, router])
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
         <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-pulse">
            <Tent size={32} />
         </div>
         <Loader2 className="animate-spin text-emerald-500" size={24} />
         <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-4">Verificando Credenciais...</p>
      </div>
    )
  }

  if (status === "unauthenticated" && pathname !== "/login") {
    return null
  }
  return <>{children}</>
}
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Tent, Lock, Mail, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError("Email ou senha incorretos.")
      setIsLoading(false)
    } else {
      router.push("/") // Vai para o Dashboard após logar
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 selection:bg-emerald-500/30">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1f2e] border border-slate-800 p-8 md:p-10 rounded-[32px] shadow-2xl w-full max-w-md relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center mb-10 relative z-10">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <Tent size={32} />
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Grupo 107º</h1>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">Acesso Restrito</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-4 rounded-2xl text-center uppercase tracking-widest">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Email de Acesso</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tesouraria@107.com"
                className="w-full bg-[#0f172a] border border-slate-800 text-slate-200 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full bg-[#0f172a] border border-slate-800 text-slate-200 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium"
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs p-4 rounded-2xl transition-all disabled:opacity-50 mt-8 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40">
            {isLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Entrar no Sistema"}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
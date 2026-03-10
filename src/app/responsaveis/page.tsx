"use client"

import { useEffect, useState } from "react"
import { Loader2, UserCheck, Trash2, Phone, Search, Mail, Filter } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function ResponsaveisPage() {
  const [guardians, setGuardians] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  async function loadData() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/youth") 
      const data = await res.json()
      
      // SOLUÇÃO AQUI: Adicionado (y.guardians || []) para evitar o erro "Cannot read properties of undefined"
      const allGuardians = data.flatMap((y: any) => 
        (y.guardians || []).map((g: any) => ({ ...g, youthName: y.name, branch: y.branch }))
      )
      setGuardians(allGuardians)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const formatPhone = (v: string) => {
    if (!v) return "";
    const n = v.replace(/\D/g, "")
    return n.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  const filteredGuardians = guardians.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.youthName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 min-h-screen">
      
      {/* HEADER CARD - DARK THEME */}
      <div className="bg-[#1a1f2e] p-8 rounded-[32px] border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Responsáveis</h1>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1 flex items-center gap-2">
            <UserCheck size={14} className="text-emerald-500" /> Gestão de Encarregados 107º
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* BUSCA COM ANIMAÇÃO VISUAL */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Buscar responsável ou jovem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0f172a] border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 w-full md:w-80 transition-all font-medium"
            />
          </div>
          
          <div className="bg-[#0f172a] border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total:</span>
             <span className="text-emerald-500 font-black tracking-tight italic">
               {filteredGuardians.length} Cadastrados
             </span>
          </div>
        </div>
      </div>

      {/* GRID DE RESPONSÁVEIS COM ANIMAÇÃO */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-emerald-500" size={40} />
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredGuardians.map((g) => (
              <motion.div
                key={g.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="bg-[#1a1f2e] border border-slate-800 p-6 rounded-[28px] hover:border-emerald-500/30 transition-all group shadow-lg"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0f172a] border border-slate-800 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:border-emerald-500/50 transition-all">
                      <UserCheck size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-100 uppercase tracking-tight leading-tight">{g.name}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        Jovem: <span className="text-emerald-500 italic">{g.youthName}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-800/50 pt-5">
                  <a 
                    href={`tel:${g.phone}`} 
                    className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group/link"
                  >
                    <div className="p-2 bg-[#0f172a] rounded-lg group-hover/link:text-emerald-500 transition-colors">
                      <Phone size={14} />
                    </div>
                    <span className="text-sm font-bold tracking-tighter">{formatPhone(g.phone)}</span>
                  </a>
                  
                  <div className="flex gap-2 mt-4 pt-2">
                    <button className="flex-1 bg-[#0f172a] hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-500 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                      <Mail size={14} /> Mensagem
                    </button>
                    <button className="p-2.5 bg-[#0f172a] hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 text-slate-600 hover:text-red-500 rounded-xl transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {filteredGuardians.length === 0 && !isLoading && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-center py-20 bg-[#1a1f2e] rounded-[32px] border border-slate-800 border-dashed"
        >
          <p className="text-slate-500 font-black uppercase tracking-[0.2em]">Nenhum responsável encontrado para "{searchTerm}"</p>
        </motion.div>
      )}
    </div>
  )
}
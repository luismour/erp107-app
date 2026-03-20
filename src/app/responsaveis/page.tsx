"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserCheck, Search, Loader2, Phone, Users, ShieldCheck } from "lucide-react"

interface Dependent {
  id?: string;
  name: string;
  branch: string;
}

interface GuardianGroup {
  name: string;
  phone: string;
  dependents: Dependent[];
}

export default function ResponsaveisPage() {
  const [youths, setYouths] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  async function loadData() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/youth")
      const data = await res.json()
      setYouths(Array.isArray(data) ? data : [])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const groupedGuardians = youths.reduce((acc: Record<string, GuardianGroup>, youth) => {
    if (!youth.guardians || youth.guardians.length === 0) return acc;
    
    youth.guardians.forEach((guardian: any) => {
      if (!guardian.name || !guardian.phone) return;
      
      const phoneKey = guardian.phone;
      if (!acc[phoneKey]) {
        acc[phoneKey] = {
          name: guardian.name,
          phone: guardian.phone,
          dependents: []
        };
      }
      
      if (!acc[phoneKey].dependents.find((d: Dependent) => d.id === youth.id)) {
        acc[phoneKey].dependents.push({ id: youth.id, name: youth.name, branch: youth.branch });
      }
    });
    return acc;
  }, {});

  const guardiansList: GuardianGroup[] = Object.values(groupedGuardians).sort((a: GuardianGroup, b: GuardianGroup) => a.name.localeCompare(b.name));

  const filteredGuardians = guardiansList.filter((g: GuardianGroup) => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.phone.includes(searchTerm) ||
    g.dependents.some((d: Dependent) => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 min-h-screen transition-colors duration-300">
      
      <div className="bg-white dark:bg-[#1a1f2e] p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 text-center xl:text-left w-full xl:w-auto">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase transition-colors">Responsáveis</h1>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1 flex items-center justify-center xl:justify-start gap-2">
            <UserCheck size={14} className="text-blue-600 dark:text-blue-500" /> Diretório de Contatos Familiares
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 w-full xl:w-auto relative z-10 justify-end items-center">
          <div className="relative group w-full lg:w-72 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input 
              type="text" placeholder="Buscar por pai, telefone ou jovem..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
              className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-blue-500/50 w-full font-medium transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600" 
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl w-fit transition-colors shadow-sm dark:shadow-md">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 flex items-center justify-center"><Users size={20} /></div>
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest transition-colors">Famílias Cadastradas</p>
          <p className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter transition-colors">{guardiansList.length} Registos</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
      ) : filteredGuardians.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#1a1f2e] rounded-[32px] border border-slate-200 dark:border-slate-800 border-dashed transition-colors">
          <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">Nenhum responsável encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredGuardians.map((guardian: GuardianGroup, index: number) => (
              <motion.div 
                key={index} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} 
                className="bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 p-6 rounded-[28px] flex flex-col justify-between h-full shadow-sm dark:shadow-xl hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
                
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 dark:text-slate-500 transition-colors uppercase border border-slate-200 dark:border-slate-700">
                      {guardian.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white leading-tight truncate transition-colors" title={guardian.name}>{guardian.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Responsável Legal</p>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    {guardian.dependents.map((dep: Dependent, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-[#0f172a] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 transition-colors">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate pr-2 transition-colors flex items-center gap-1.5">
                          <ShieldCheck size={12} className="text-slate-400" />
                          {dep.name}
                        </span>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest shrink-0 bg-white dark:bg-[#1a1f2e] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {dep.branch}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/50 transition-colors">
                  <a 
                    href={`https://wa.me/55${guardian.phone.replace(/\D/g, '')}`} 
                    target="_blank" rel="noopener noreferrer" 
                    className="w-full flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    <Phone size={14} /> {guardian.phone}
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
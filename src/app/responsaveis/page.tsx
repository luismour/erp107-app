"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { UserCheck, Search, Loader2, Phone, MessageCircle, User } from "lucide-react"

export default function ResponsaveisPage() {
  const [guardians, setGuardians] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  async function loadData() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/youth")
      const data = await res.json()
      
      if (Array.isArray(data)) {
        const extracted = data.reduce((acc: any[], youth: any) => {
          if (youth.guardians && youth.guardians.length > 0) {
            youth.guardians.forEach((g: any) => {
              acc.push({
                id: g.id,
                name: g.name,
                phone: g.phone,
                youthName: youth.name,
                youthBranch: youth.branch
              })
            })
          }
          return acc
        }, [])
        setGuardians(extracted)
      } else {
        setGuardians([])
      }
    } catch (error) {
      setGuardians([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleWhatsApp = (guardianName: string, youthName: string, phone: string) => {
    if (!phone) return
    const cleanPhone = phone.replace(/\D/g, '')
    const message = `Olá, ${guardianName}! Tudo bem? Aqui é do Grupo Escoteiro 107º Padre Roma. Passando rapidinho para lembrar que a mensalidade do(a) ${youthName} está em aberto. Quando puder, dá um alô aqui para a nossa Tesouraria para a gente acertar, tá bom? Qualquer dúvida, é só falar. Muito obrigado e Sempre Alerta!`;
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/55${cleanPhone}?text=${encodedMessage}`, '_blank')
  }

  const filteredGuardians = guardians.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.youthName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 min-h-screen">
      <div className="bg-[#1a1f2e] p-8 rounded-[32px] border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 text-center xl:text-left w-full xl:w-auto">
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Responsáveis</h1>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1 flex items-center justify-center xl:justify-start gap-2">
            <UserCheck size={14} className="text-emerald-500" /> Contatos e Cobranças
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 w-full xl:w-auto relative z-10 justify-end items-center">
          <div className="relative group w-full lg:w-80 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar responsável ou jovem..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0f172a] border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-emerald-500/50 w-full font-medium"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 className="animate-spin text-emerald-500" size={40} />
          </div>
        ) : filteredGuardians.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-widest">
            Nenhum responsável encontrado
          </div>
        ) : filteredGuardians.map((guardian, index) => (
          <motion.div 
            layout 
            key={`${guardian.id}-${index}`} 
            className="bg-[#1a1f2e] border border-slate-800 p-6 rounded-[28px] hover:border-emerald-500/30 transition-all group shadow-xl flex flex-col"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <UserCheck size={28} />
              </div>
              <div className="pt-1">
                <h3 className="font-black text-slate-100 uppercase tracking-tight text-lg leading-tight line-clamp-2">
                  {guardian.name}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-slate-400 text-xs font-bold">
                  <Phone size={14} className="text-emerald-500" />
                  {guardian.phone || "Sem telefone"}
                </div>
              </div>
            </div>

            <div className="flex-1 bg-[#0f172a] border border-slate-800 rounded-2xl p-4 mb-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">
                Responsável por
              </span>
              <div className="flex items-center gap-3 text-slate-300">
                <User size={16} className="text-slate-500 shrink-0" />
                <span className="font-bold text-sm uppercase truncate">{guardian.youthName}</span>
              </div>
              <div className="mt-2 pl-7">
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {guardian.youthBranch}
                </span>
              </div>
            </div>

            <button 
              onClick={() => handleWhatsApp(guardian.name, guardian.youthName, guardian.phone)}
              disabled={!guardian.phone}
              className="w-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500 p-4 rounded-2xl transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle size={18} /> Cobrar Mensalidade
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
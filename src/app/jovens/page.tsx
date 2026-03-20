"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Search, Plus, Loader2, X, Trash2, User, Phone, Wallet, Calendar, FileText, ChevronRight } from "lucide-react"
import BranchFilter from "@/components/BranchFilter"

export default function JovensPage() {
  const [youths, setYouths] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  
  // MODAL DE CADASTRO
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedGuardianSelect, setSelectedGuardianSelect] = useState("")
  const [guardianSearchTerm, setGuardianSearchTerm] = useState("")
  const [isGuardianDropdownOpen, setIsGuardianDropdownOpen] = useState(false)

  const [viewYouth, setViewYouth] = useState<any | null>(null)

  const [formData, setFormData] = useState({ name: "", branch: "", age: "", guardianName: "", guardianPhone: "" })
  const branches = ["Lobinho", "Escoteiro", "Sênior", "Pioneiro"]

  async function loadData() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/youth")
      const data = await res.json()
      setYouths(Array.isArray(data) ? data : [])
    } catch { 
      setYouths([]) 
    } finally { 
      setIsLoading(false) 
    }
  }

  useEffect(() => { loadData() }, [])

  const uniqueGuardians = Array.from(
    new Map(
      youths
        .flatMap((y) => y.guardians || [])
        .filter((g) => g.name && g.phone)
        .map((g) => [g.phone, { name: g.name, phone: g.phone }])
    ).values()
  )

  const handleOpenCreate = () => {
    setFormData({ name: "", branch: "", age: "", guardianName: "", guardianPhone: "" })
    setSelectedGuardianSelect("")
    setGuardianSearchTerm("") 
    setIsModalOpen(true)
  }

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ageNum = parseInt(e.target.value)
    let autoBranch = formData.branch
    
    if (!isNaN(ageNum)) {
      if (ageNum >= 6 && ageNum <= 9) autoBranch = "Lobinho"
      else if (ageNum >= 10 && ageNum <= 14) autoBranch = "Escoteiro"
      else if (ageNum >= 15 && ageNum <= 17) autoBranch = "Sênior"
      else if (ageNum >= 18 && ageNum <= 22) autoBranch = "Pioneiro"
      else autoBranch = ""
    } else {
      autoBranch = ""
    }
    setFormData({ ...formData, age: e.target.value, branch: autoBranch })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/youth", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(formData) 
      })
      if (res.ok) { 
        setIsModalOpen(false)
        await loadData() 
      }
    } finally { 
      setIsSubmitting(false) 
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este jovem permanentemente?")) return
    await fetch(`/api/youth/${id}`, { method: "DELETE" })
    if (viewYouth?.id === id) setViewYouth(null)
    await loadData()
  }

  const filteredYouths = Array.isArray(youths) ? youths.filter(y => {
    const matchesBranch = selectedBranch ? y.branch === selectedBranch : true
    const matchesSearch = y.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesBranch && matchesSearch
  }) : []

  const filteredGuardians = uniqueGuardians.filter(g => 
    g.name.toLowerCase().includes(guardianSearchTerm.toLowerCase()) || 
    g.phone.includes(guardianSearchTerm)
  )

  const getBalance = (funds = []) => funds.reduce((acc: number, curr: any) => curr.type === 'credit' ? acc + Number(curr.amount) : acc - Number(curr.amount), 0)
  
  const statusConfig: Record<string, { label: string, color: string }> = {
    paid: { label: 'Pago', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-200 dark:border-emerald-500/20' },
    pending: { label: 'Pendente', color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-500/20' },
    overdue: { label: 'Atrasado', color: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border-red-200 dark:border-red-500/20' }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 min-h-screen transition-colors duration-300">
      
      <div className="bg-white dark:bg-[#1a1f2e] p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 text-center xl:text-left w-full xl:w-auto">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase transition-colors">Jovens</h1>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1 flex items-center justify-center xl:justify-start gap-2">
            <Users size={14} className="text-emerald-600 dark:text-emerald-500" /> Cadastro de Membros do Grupo
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 w-full xl:w-auto relative z-10 justify-end items-center">
          <div className="relative group w-full lg:w-64 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input 
              type="text" placeholder="Buscar jovem..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
              className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-emerald-500/50 w-full font-medium transition-colors" 
            />
          </div>
          <button 
            onClick={handleOpenCreate} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all w-full lg:w-auto shadow-lg shadow-emerald-500/20"
          >
            <Plus size={16} /> Novo Jovem
          </button>
        </div>
      </div>
      
      <BranchFilter selectedBranch={selectedBranch} onSelect={setSelectedBranch} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
        ) : filteredYouths.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Nenhum jovem encontrado</div>
        ) : filteredYouths.map((youth) => (
          <motion.div 
            layout 
            key={youth.id} 
            onClick={() => setViewYouth(youth)} 
            className="bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 p-6 rounded-[28px] hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all group shadow-sm dark:shadow-xl cursor-pointer flex flex-col justify-between h-full relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                  <User size={24} />
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(youth.id); }} 
                  className="text-slate-400 dark:text-slate-600 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-500 p-2 rounded-xl transition-all" 
                  title="Excluir Jovem"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight text-lg leading-tight relative z-10 pr-4 transition-colors">
                {youth.name}
              </h3>
              <div className="flex items-center gap-2 mt-2 relative z-10">
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/10">
                  {youth.branch}
                </span>
                <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800/50 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 transition-colors">
                  {youth.age} anos
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-end relative z-10 transition-colors">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Responsável</p>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs font-bold truncate max-w-[180px] transition-colors">
                  {youth.guardians?.[0]?.name || "Não informado"}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 group-hover:border-emerald-300 dark:group-hover:border-emerald-500/30 transition-all">
                <ChevronRight size={16} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {viewYouth && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 rounded-[32px] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors"
            >
              
              <div className="relative p-6 md:p-8 border-b border-slate-200 dark:border-slate-800/50 shrink-0 bg-slate-50 dark:bg-[#0f172a]/50 transition-colors">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent" />
                <button onClick={() => setViewYouth(null)} className="absolute top-6 right-6 text-slate-500 hover:text-red-500 p-2 bg-white dark:bg-[#1a1f2e] rounded-xl border border-slate-200 dark:border-slate-800 transition-colors z-10">
                  <X size={20} />
                </button>
                
                <div className="flex items-start gap-5 pr-10">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-500 shrink-0">
                    <User size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase leading-tight transition-colors">
                      {viewYouth.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                        {viewYouth.branch}
                      </span>
                      <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-[#1a1f2e] px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 transition-colors">
                        {viewYouth.age} anos
                      </span>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
                        ID: {viewYouth.id.split('-')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto hide-scrollbar">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                      <Phone size={16} className="text-slate-400" />
                      <h3 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Contacto / Responsável</h3>
                    </div>
                    {viewYouth.guardians && viewYouth.guardians.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase transition-colors">
                          {viewYouth.guardians[0].name}
                        </p>
                        <a href={`https://wa.me/55${viewYouth.guardians[0].phone}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors border border-emerald-200 dark:border-emerald-500/20">
                          WhatsApp: {viewYouth.guardians[0].phone}
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Sem responsável registado.</p>
                    )}
                  </div>

                  <div className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden transition-colors">
                    <div className="absolute right-[-10%] top-[-10%] opacity-5 text-emerald-500 pointer-events-none"><Wallet size={120} /></div>
                    <div className="flex items-center gap-2 mb-2 relative z-10">
                      <Wallet size={16} className="text-slate-400" />
                      <h3 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Caixa Individual</h3>
                    </div>
                    <div className="relative z-10">
                      {(() => {
                        const balance = getBalance(viewYouth.funds);
                        return (
                          <p className={`text-4xl font-black italic tracking-tighter ${balance >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500'}`}>
                            R$ {balance.toFixed(2)}
                          </p>
                        )
                      })()}
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Saldo para atividades e Rifas</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <Calendar size={16} className="text-slate-400" />
                    <h3 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Histórico de Mensalidades</h3>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden transition-colors">
                    {viewYouth.fees && viewYouth.fees.length > 0 ? (
                      <div className="divide-y divide-slate-200 dark:divide-slate-800/50 max-h-[300px] overflow-y-auto hide-scrollbar transition-colors">
                        {[...viewYouth.fees]
                          .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                          .map((fee: any) => {
                            const status = statusConfig[fee.status] || statusConfig.pending;
                            const isLate = fee.status === 'pending' && new Date(fee.dueDate) < new Date();
                            const finalStatus = isLate ? statusConfig.overdue : status;

                            return (
                              <div key={fee.id} className="p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 transition-colors">
                                    <FileText size={16} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase transition-colors">{fee.month.toString().padStart(2, '0')}/{fee.year}</p>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                                      Venc: {new Date(fee.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                  <span className="text-sm font-black italic text-slate-700 dark:text-slate-300 transition-colors">R$ {Number(fee.amount).toFixed(2)}</span>
                                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${finalStatus.color}`}>
                                    {finalStatus.label}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <FileText className="mx-auto text-slate-400 dark:text-slate-600 mb-3" size={32} />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nenhuma mensalidade registada</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden overflow-y-auto max-h-[90vh] hide-scrollbar transition-colors"
            >
              
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase transition-colors">Novo Jovem</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-red-500 p-2 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                  required placeholder="Nome Completo do Jovem" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-slate-200 outline-none focus:border-emerald-500/50 text-sm font-medium transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    required type="number" placeholder="Idade (Ex: 12)" min="6" max="22" 
                    value={formData.age} onChange={handleAgeChange} 
                    className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-slate-200 outline-none focus:border-emerald-500/50 text-sm font-medium transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                  />
                  <select 
                    required disabled value={formData.branch} 
                    className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-slate-200 outline-none text-xs font-bold uppercase opacity-60 cursor-not-allowed transition-colors"
                  >
                    <option value="">Ramo Auto.</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800/50 mt-4 transition-colors">
                  <h3 className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-3 pl-1">Dados do Responsável</h3>

                  {uniqueGuardians.length > 0 && (
                    <div className="mb-4 relative">
                      <div className="relative z-50">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                        <input 
                          type="text" placeholder="Buscar Responsável Existente..." 
                          value={guardianSearchTerm} 
                          onChange={(e) => { setGuardianSearchTerm(e.target.value); setIsGuardianDropdownOpen(true) }}
                          onFocus={() => setIsGuardianDropdownOpen(true)}
                          className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-3 pl-11 pr-10 text-slate-900 dark:text-slate-300 outline-none focus:border-emerald-500/50 text-xs font-bold transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                        {guardianSearchTerm && (
                          <button 
                            type="button" 
                            onClick={() => { setGuardianSearchTerm(""); setSelectedGuardianSelect(""); setFormData({ ...formData, guardianName: "", guardianPhone: "" }); setIsGuardianDropdownOpen(false) }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>

                      {isGuardianDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsGuardianDropdownOpen(false)} />
                          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto hide-scrollbar transition-colors">
                            <div className="p-2 flex flex-col gap-1">
                              <button 
                                type="button"
                                onClick={() => { setGuardianSearchTerm(""); setSelectedGuardianSelect(""); setFormData({ ...formData, guardianName: "", guardianPhone: "" }); setIsGuardianDropdownOpen(false) }}
                                className="w-full text-left p-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[10px] tracking-widest font-black uppercase transition-colors"
                              >
                                + Digitar Novo Responsável
                              </button>
                              
                              {filteredGuardians.length > 0 ? (
                                filteredGuardians.map((g, idx) => (
                                  <button 
                                    key={idx} type="button"
                                    onClick={() => { setSelectedGuardianSelect(g.phone); setGuardianSearchTerm(g.name); setFormData({ ...formData, guardianName: g.name, guardianPhone: g.phone }); setIsGuardianDropdownOpen(false) }}
                                    className="w-full text-left p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex justify-between items-center"
                                  >
                                    <span className="truncate pr-2">{g.name}</span>
                                    <span className="text-[10px] text-slate-500 tracking-wider shrink-0">{g.phone}</span>
                                  </button>
                                ))
                              ) : (
                                <div className="p-3 text-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Nenhum encontrado</div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    <input 
                      required placeholder="Nome do Responsável" 
                      value={formData.guardianName} onChange={e => setFormData({...formData, guardianName: e.target.value})} 
                      className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-slate-200 outline-none focus:border-emerald-500/50 text-sm font-medium transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                    />
                    <input 
                      required placeholder="Telefone (81 9...)" 
                      value={formData.guardianPhone} onChange={e => setFormData({...formData, guardianPhone: e.target.value})} 
                      className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-slate-200 outline-none focus:border-emerald-500/50 text-sm font-medium transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                    />
                  </div>
                </div>
                
                <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs p-4 rounded-2xl disabled:opacity-50 mt-4 shadow-lg shadow-emerald-500/20 transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Cadastrar Jovem"}
                </button>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
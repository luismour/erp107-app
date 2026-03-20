"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, Loader2, X, TrendingDown, Calendar, Filter, Trash2, FileText, Tag } from "lucide-react"

export default function DespesasPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ description: "", amount: "", category: "Sede", date: new Date().toISOString().split('T')[0] })

  const categories = ["Sede", "Atividades", "Equipamentos", "Outros"]

  async function loadData() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/expenses").catch(() => ({ json: () => [] }))
      const data = await res.json()
      setExpenses(Array.isArray(data) ? data : [])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount), date: new Date(formData.date).toISOString() })
      })
      if (res.ok) { setIsModalOpen(false); setFormData({ description: "", amount: "", category: "Sede", date: new Date().toISOString().split('T')[0] }); await loadData() }
    } finally { setIsSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta despesa permanentemente?")) return
    await fetch(`/api/expenses/${id}`, { method: "DELETE" })
    await loadData()
  }

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "ALL" ? true : exp.category === categoryFilter
    return matchesSearch && matchesCategory
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 min-h-screen transition-colors duration-300">
      
      {/* CABEÇALHO */}
      <div className="bg-white dark:bg-[#1a1f2e] p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 text-center xl:text-left w-full xl:w-auto">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase transition-colors">Despesas</h1>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1 flex items-center justify-center xl:justify-start gap-2">
            <TrendingDown size={14} className="text-orange-600 dark:text-orange-500" /> Saídas Financeiras do Grupo
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 w-full xl:w-auto relative z-10 justify-end items-center">
          <div className="relative group w-full lg:w-64 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input type="text" placeholder="Buscar despesa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-orange-500/50 w-full font-medium transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600" />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-orange-500/20 w-full lg:w-auto whitespace-nowrap">
            <Plus size={16} /> Nova Despesa
          </button>
        </div>
      </div>

      {/* DASHBOARD RÁPIDO & FILTROS */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex gap-4">
          <div className="flex items-center gap-4 bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl transition-colors shadow-sm dark:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 flex items-center justify-center"><TrendingDown size={20} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest transition-colors">Total Filtrado</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter transition-colors">R$ {totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto hide-scrollbar">
          <button onClick={() => setCategoryFilter("ALL")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${categoryFilter === "ALL" ? 'bg-slate-900 dark:bg-[#0f172a] border-slate-900 dark:border-slate-600 text-white' : 'bg-white dark:bg-transparent border-slate-200 dark:border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shadow-sm dark:shadow-none'}`}>Todos</button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${categoryFilter === cat ? 'bg-slate-900 dark:bg-[#0f172a] border-slate-900 dark:border-slate-600 text-white' : 'bg-white dark:bg-transparent border-slate-200 dark:border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shadow-sm dark:shadow-none'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DE DESPESAS */}
      <div className="bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-xl dark:shadow-2xl transition-colors">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={40} /></div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-20 border-dashed border-2 border-slate-200 dark:border-slate-800/50 m-8 rounded-[24px] transition-colors">
            <FileText className="mx-auto text-slate-400 dark:text-slate-600 mb-4" size={48} />
            <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">Nenhum registo encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50 max-h-[600px] overflow-y-auto hide-scrollbar transition-colors">
            <AnimatePresence>
              {filteredExpenses.map((exp) => (
                <motion.div key={exp.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-[#0f172a]/50 transition-colors group">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20">
                      <TrendingDown size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 transition-colors">{exp.description}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1"><Tag size={10}/> {exp.category}</span>
                        <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1"><Calendar size={10}/> {new Date(exp.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full md:w-auto gap-4 pl-16 md:pl-0">
                    <p className="text-xl font-black italic tracking-tighter text-orange-600 dark:text-orange-500 mt-1 transition-colors">-R$ {Number(exp.amount).toFixed(2)}</p>
                    <button onClick={() => handleDelete(exp.id)} className="opacity-100 md:opacity-0 group-hover:opacity-100 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/30 p-2.5 rounded-xl transition-all"><Trash2 size={16} /></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* MODAL NOVA DESPESA */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden transition-colors">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent" />
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase transition-colors">Lançar Despesa</h2>
                  <p className="text-[10px] font-bold text-orange-600 dark:text-orange-500 uppercase tracking-widest mt-1">Registo de Saída</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-red-500 transition-colors p-2 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Descrição (Comprovativo)</label>
                  <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ex: Conta de Energia..." className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-slate-200 focus:border-orange-500/50 outline-none text-sm font-medium transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Valor (R$)</label>
                    <input required type="number" step="0.01" min="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-orange-600 dark:text-orange-500 text-xl font-black italic focus:border-orange-500/50 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Data</label>
                    <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-slate-200 outline-none text-sm font-bold focus:border-orange-500/50 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Categoria</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-slate-200 focus:border-orange-500/50 outline-none uppercase text-xs font-bold transition-colors">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs p-4 rounded-2xl transition-all disabled:opacity-50 mt-4 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Registar Saída"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
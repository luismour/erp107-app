"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingDown, Search, Plus, Loader2, X, Trash2, Receipt, Calendar } from "lucide-react"

export default function DespesasPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    "Água / Luz / Internet",
    "Aluguel / Sede",
    "Material de Campo",
    "Loja Escoteira",
    "Alimentação",
    "Transporte",
    "Eventos",
    "Outros"
  ]

  async function loadData() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/expenses")
      const data = await res.json()
      setExpenses(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, amount, date, category })
    })

    if (res.ok) {
      setIsModalOpen(false)
      setDescription("")
      setAmount("")
      setCategory("")
      await loadData()
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta despesa permanentemente?")) return
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" })
    if (res.ok) setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 min-h-screen">
      <div className="bg-[#1a1f2e] p-8 rounded-[32px] border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center xl:text-left w-full xl:w-auto">
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Despesas</h1>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1 flex items-center justify-center xl:justify-start gap-2">
            <TrendingDown size={14} className="text-rose-500" /> Controle de Saídas do Grupo
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 w-full xl:w-auto relative z-10 justify-end items-center">
          <div className="relative group w-full lg:w-64 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Buscar despesa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0f172a] border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 w-full font-medium transition-all"
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-rose-500/20 w-full lg:w-auto"
          >
            <Plus size={16} /> Nova Despesa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1f2e] border border-slate-800 p-6 rounded-[28px] shadow-xl md:col-span-3 lg:col-span-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500">
              <Receipt size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Gasto</p>
              <h2 className="text-3xl font-black text-white italic tracking-tighter">R$ {totalExpenses.toFixed(2)}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1f2e] rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0f172a]/50 text-slate-500 uppercase text-[10px] font-black tracking-[0.2em] border-b border-slate-800">
              <tr>
                <th className="px-10 py-6">Descrição / Categoria</th>
                <th className="px-10 py-6">Data</th>
                <th className="px-10 py-6 text-right">Valor / Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-rose-500" size={32} /></td></tr>
              ) : filteredExpenses.length === 0 ? (
                <tr><td colSpan={3} className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest">Nenhuma despesa encontrada</td></tr>
              ) : filteredExpenses.map((expense) => (
                <tr key={expense.id} className="group hover:bg-[#1e293b]/50 transition-all">
                  <td className="px-10 py-6">
                    <p className="font-black text-slate-100 text-base uppercase tracking-tight">{expense.description}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{expense.category}</p>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 text-slate-400 font-bold italic">
                      <Calendar size={14} />
                      {new Date(expense.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        className="p-2.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                      <p className="font-black text-rose-500 text-lg italic min-w-[100px]">
                        - R$ {expense.amount.toFixed(2)}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-[#1a1f2e] border border-slate-800 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-transparent" />
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Nova Despesa</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-red-500 p-2 bg-[#0f172a] border border-slate-800 rounded-xl"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Descrição</label>
                  <input required type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Compra de Bambu" className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-slate-200 focus:border-rose-500/50 outline-none text-sm font-medium" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Valor (R$)</label>
                    <input required type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-white text-xl font-black italic focus:border-rose-500/50 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Data</label>
                    <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-slate-200 focus:border-rose-500/50 outline-none text-sm font-medium [color-scheme:dark]" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Categoria</label>
                  <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-slate-200 focus:border-rose-500/50 outline-none uppercase text-xs font-bold">
                    <option value="">Selecione...</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-xs p-4 rounded-2xl disabled:opacity-50 mt-4 shadow-lg shadow-rose-500/20">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Registar Despesa"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
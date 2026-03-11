"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingDown, Search, Plus, Loader2, X, Trash2, Calendar, FileDown } from "lucide-react"

export default function DespesasPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    description: "",
    amount: ""
  })

  async function loadData() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/expenses")
      const data = await res.json()
      setExpenses(Array.isArray(data) ? data : [])
    } catch (error) {
      setExpenses([])
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
        body: JSON.stringify({
          description: formData.description,
          amount: parseFloat(formData.amount)
        })
      })
      if (res.ok) {
        setIsModalOpen(false)
        setFormData({ description: "", amount: "" })
        await loadData()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta despesa permanentemente?")) return
    await fetch(`/api/expenses/${id}`, { method: "DELETE" })
    await loadData()
  }

  const handleDownloadExcel = () => {
    const totalExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
    
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
          th { background-color: #f97316; color: white; font-weight: bold; padding: 12px; border: 1px solid #ddd; text-align: left; text-transform: uppercase; font-size: 12px; }
          td { padding: 10px; border: 1px solid #ddd; text-align: left; font-size: 14px; }
          .amount { font-weight: bold; color: #ea580c; }
          .title { font-size: 18px; font-weight: bold; color: #1e293b; margin-bottom: 20px; text-transform: uppercase; }
          .footer { font-weight: bold; background-color: #f1f5f9; text-align: right; }
          .total { font-weight: bold; color: #ef4444; background-color: #fee2e2; }
        </style>
      </head>
      <body>
        <div class="title">Relatório de Gastos - Grupo Escoteiro 107º Padre Roma</div>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(exp => `
              <tr>
                <td>${new Date(exp.createdAt || Date.now()).toLocaleDateString('pt-BR')}</td>
                <td>${exp.description || 'Despesa Geral'}</td>
                <td class="amount">R$ ${Number(exp.amount).toFixed(2).replace('.', ',')}</td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="2" class="footer">TOTAL DE SAÍDAS:</td>
              <td class="total">R$ ${totalExpenses.toFixed(2).replace('.', ',')}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Relatorio_Despesas_107.xls'
    link.click()
    URL.revokeObjectURL(url)
  }

  const filteredExpenses = Array.isArray(expenses) 
    ? expenses.filter(e => e.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    : []

  const totalValue = filteredExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 min-h-screen">
      <div className="bg-[#1a1f2e] p-8 rounded-[32px] border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 text-center xl:text-left w-full xl:w-auto">
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Despesas</h1>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1 flex items-center justify-center xl:justify-start gap-2">
            <TrendingDown size={14} className="text-orange-500" /> Controle de Saídas
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 w-full xl:w-auto relative z-10 justify-end items-center">
          <div className="relative group w-full lg:w-64 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" placeholder="Buscar despesa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0f172a] border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-orange-500/50 w-full font-medium"
            />
          </div>

          <button 
            onClick={handleDownloadExcel}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-emerald-500/20 w-full lg:w-auto"
          >
            <FileDown size={16} /> Relatório (Excel)
          </button>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-orange-500/20 w-full lg:w-auto"
          >
            <Plus size={16} /> Nova Despesa
          </button>
        </div>
      </div>

      <div className="bg-[#1a1f2e] border border-slate-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Histórico de Lançamentos</h2>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Exibido</p>
            <p className="text-2xl font-black text-orange-500 italic tracking-tighter">R$ {totalValue.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-orange-500" size={40} /></div>
          ) : filteredExpenses.length === 0 ? (
            <div className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest">Nenhuma despesa registrada</div>
          ) : filteredExpenses.map((exp) => (
            <motion.div layout key={exp.id} className="flex items-center justify-between bg-[#0f172a] p-5 rounded-2xl border border-slate-800 hover:border-orange-500/30 transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <TrendingDown size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-200 text-lg">{exp.description}</p>
                  <div className="flex items-center gap-2 text-slate-500 mt-1">
                    <Calendar size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {new Date(exp.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <p className="text-xl font-black text-white italic tracking-tighter">
                  - R$ {Number(exp.amount).toFixed(2)}
                </p>
                <button 
                  onClick={() => handleDelete(exp.id)} 
                  className="text-slate-600 hover:text-red-500 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1a1f2e] border border-slate-800 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Lançar Despesa</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-red-500 p-2 bg-[#0f172a] border border-slate-800 rounded-xl"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required placeholder="Descrição da Despesa" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-slate-200 outline-none focus:border-orange-500/50 text-sm font-medium" />
                <input required type="number" step="0.01" placeholder="Valor (R$)" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-slate-200 outline-none focus:border-orange-500/50 text-sm font-medium" />
                
                <button type="submit" disabled={isSubmitting} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs p-4 rounded-2xl disabled:opacity-50 mt-4 shadow-lg shadow-orange-500/20">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Registrar Saída"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
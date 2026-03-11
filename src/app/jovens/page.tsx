"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Search, Plus, Loader2, X, Trash2, User, Phone } from "lucide-react"
import BranchFilter from "@/components/BranchFilter"
export default function JovensPage() {
  const [youths, setYouths] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    branch: "",
    age: "",
    guardianName: "",
    guardianPhone: ""
  })

  const branches = ["Lobinho", "Escoteiro", "Sênior", "Pioneiro"]

  async function loadData() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/youth")
      const data = await res.json()
      setYouths(Array.isArray(data) ? data : [])
    } catch (error) {
      setYouths([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

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
        setFormData({ name: "", branch: "", age: "", guardianName: "", guardianPhone: "" })
        await loadData()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este jovem permanentemente?")) return
    await fetch(`/api/youth/${id}`, { method: "DELETE" })
    await loadData()
  }

  const filteredYouths = Array.isArray(youths) 
    ? youths.filter(y => {
        const matchesBranch = selectedBranch ? y.branch === selectedBranch : true
        const matchesSearch = y.name.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesBranch && matchesSearch
      })
    : []

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 min-h-screen">
      <div className="bg-[#1a1f2e] p-8 rounded-[32px] border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 text-center xl:text-left w-full xl:w-auto">
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Jovens</h1>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1 flex items-center justify-center xl:justify-start gap-2">
            <Users size={14} className="text-emerald-500" /> Cadastro de Membros do Grupo
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-4 w-full xl:w-auto relative z-10 justify-end items-center">
          <div className="relative group w-full lg:w-64 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" placeholder="Buscar jovem..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0f172a] border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-emerald-500/50 w-full font-medium"
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all w-full lg:w-auto">
            <Plus size={16} /> Novo Jovem
          </button>
        </div>
      </div>
      
      <BranchFilter selectedBranch={selectedBranch} onSelect={setSelectedBranch} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
        ) : filteredYouths.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-widest">Nenhum jovem cadastrado</div>
        ) : filteredYouths.map((youth) => (
          <motion.div layout key={youth.id} className="bg-[#1a1f2e] border border-slate-800 p-6 rounded-[28px] hover:border-emerald-500/30 transition-all group shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><User size={24} /></div>
              <button onClick={() => handleDelete(youth.id)} className="text-slate-600 hover:text-red-500 p-2 rounded-xl transition-all"><Trash2 size={18} /></button>
            </div>
            <h3 className="font-black text-slate-100 uppercase tracking-tight text-lg">{youth.name}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">{youth.branch}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">{youth.age} anos</span>
            </div>
            <div className="mt-6 space-y-3 pt-4 border-t border-slate-800/50">
              <div className="flex items-center gap-3 text-slate-400 text-xs"><User size={14} className="text-slate-600 shrink-0" /> {youth.guardians?.[0]?.name || "Não informado"}</div>
              <div className="flex items-center gap-3 text-slate-400 text-xs"><Phone size={14} className="text-slate-600 shrink-0" /> {youth.guardians?.[0]?.phone || "Não informado"}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1a1f2e] border border-slate-800 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Novo Jovem</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-red-500 p-2 bg-[#0f172a] border border-slate-800 rounded-xl"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required placeholder="Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-slate-200 outline-none focus:border-emerald-500/50 text-sm font-medium" />
                <div className="grid grid-cols-2 gap-4">
                  <select required value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-slate-200 outline-none text-xs font-bold uppercase">
                    <option value="">Ramo</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <input required type="number" placeholder="Idade" min="6" max="21" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-slate-200 outline-none text-sm font-medium" />
                </div>
                <input required placeholder="Nome do Responsável" value={formData.guardianName} onChange={e => setFormData({...formData, guardianName: e.target.value})} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-slate-200 outline-none focus:border-emerald-500/50 text-sm font-medium" />
                <input required placeholder="Telefone (81 9...)" value={formData.guardianPhone} onChange={e => setFormData({...formData, guardianPhone: e.target.value})} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-slate-200 outline-none focus:border-emerald-500/50 text-sm font-medium" />
                <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs p-4 rounded-2xl disabled:opacity-50 mt-4 shadow-lg">
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
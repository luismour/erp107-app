"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, Loader2, X, Package, Tent, Wrench, Utensils, Archive, ArrowRightLeft, ShieldAlert, Trash2, Edit2 } from "lucide-react"

export default function InventarioPage() {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Novo estado para saber se estamos a editar ou a criar
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: "", description: "", category: "Acampamento", condition: "BOM", quantity: "1", location: "Sede Principal"
  })

  const categories = [
    { id: "Acampamento", icon: <Tent size={14} /> },
    { id: "Cozinha", icon: <Utensils size={14} /> },
    { id: "Ferramentas", icon: <Wrench size={14} /> },
    { id: "Secretaria", icon: <Archive size={14} /> },
    { id: "Outros", icon: <Package size={14} /> }
  ]

  async function loadData() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/inventory").catch(() => ({ json: () => [] }))
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // Função para abrir o modal para CRIAR
  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({ name: "", description: "", category: "Acampamento", condition: "BOM", quantity: "1", location: "Sede Principal" })
    setIsModalOpen(true)
  }

  // Função para abrir o modal para EDITAR
  const handleOpenEdit = (item: any) => {
    setEditingId(item.id)
    setFormData({
      name: item.name,
      description: item.description || "",
      category: item.category,
      condition: item.condition,
      quantity: String(item.quantity),
      location: item.location || ""
    })
    setIsModalOpen(true)
  }

  // Função para EXCLUIR
  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza que deseja excluir este material permanentemente?")) return

    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" })
      if (res.ok) {
        await loadData()
      } else {
        alert("Erro ao excluir o item.")
      }
    } catch (error) {
      alert("Erro de conexão ao tentar excluir.")
    }
  }

  // Função que envia os dados (Cria ou Edita)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const url = editingId ? `/api/inventory/${editingId}` : "/api/inventory"
    const method = editingId ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity)
        })
      })
      
      if (res.ok) {
        setIsModalOpen(false)
        await loadData()
      } else {
        alert("Erro ao guardar o material.")
      }
    } catch {
      alert("Erro de conexão.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0)
  const totalBorrowed = items.reduce((acc, curr) => acc + (curr.borrowed || 0), 0)
  const totalMaintenance = items.filter(i => i.condition === "MANUTENCAO").reduce((acc, curr) => acc + curr.quantity, 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 min-h-screen">
      
      {/* CABEÇALHO */}
      <div className="bg-[#1a1f2e] p-8 rounded-[32px] border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center xl:text-left w-full xl:w-auto">
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Almoxarifado</h1>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1 flex items-center justify-center xl:justify-start gap-2">
            <Package size={14} className="text-violet-500" /> Inventário Virtual do Grupo
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 w-full xl:w-auto relative z-10 justify-end items-center">
          <div className="relative group w-full lg:w-64 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" size={18} />
            <input 
              type="text" placeholder="Buscar material..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0f172a] border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 w-full font-medium transition-all"
            />
          </div>
          
          <button onClick={handleOpenCreate} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-violet-600/20 w-full lg:w-auto">
            <Plus size={16} /> Cadastrar Material
          </button>
        </div>
      </div>

      {/* DASHBOARD RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1f2e] border border-slate-800 p-5 rounded-[24px] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center"><Package size={20} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total no Acervo</p>
            <p className="text-2xl font-black text-white">{totalItems} <span className="text-sm text-slate-500">unids</span></p>
          </div>
        </div>
        <div className="bg-[#1a1f2e] border border-slate-800 p-5 rounded-[24px] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center"><ArrowRightLeft size={20} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Emprestados</p>
            <p className="text-2xl font-black text-white">{totalBorrowed} <span className="text-sm text-slate-500">unids</span></p>
          </div>
        </div>
        <div className="bg-[#1a1f2e] border border-slate-800 p-5 rounded-[24px] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center"><ShieldAlert size={20} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Em Manutenção</p>
            <p className="text-2xl font-black text-white">{totalMaintenance} <span className="text-sm text-slate-500">unids</span></p>
          </div>
        </div>
      </div>

      {/* FILTRO DE CATEGORIAS */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <button onClick={() => setSelectedCategory(null)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${!selectedCategory ? 'bg-violet-500/10 border-violet-500 text-violet-500' : 'bg-[#1a1f2e] border-slate-800 text-slate-500 hover:border-slate-700'}`}>
          Todos
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${selectedCategory === cat.id ? 'bg-violet-500/10 border-violet-500 text-violet-500' : 'bg-[#1a1f2e] border-slate-800 text-slate-500 hover:border-slate-700'}`}>
            {cat.icon} {cat.id}
          </button>
        ))}
      </div>

      {/* GRID DE MATERIAIS */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-500" size={40} /></div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1f2e] rounded-[32px] border border-slate-800 border-dashed">
          <Package className="mx-auto text-slate-600 mb-4" size={48} />
          <p className="text-slate-500 font-black uppercase tracking-[0.2em]">Nenhum material encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredItems.map(item => {
              const available = item.quantity - (item.borrowed || 0)
              const conditionColor = item.condition === 'MANUTENCAO' ? 'text-red-500 bg-red-500/10 border-red-500/20' : item.condition === 'NOVO' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-400 bg-slate-800/50 border-slate-700'
              
              return (
                <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1f2e] border border-slate-800 p-5 rounded-[24px] group hover:border-violet-500/30 transition-all flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${conditionColor}`}>
                        {item.condition}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-[#0f172a] flex items-center justify-center text-slate-500">
                        {categories.find(c => c.id === item.category)?.icon || <Package size={14}/>}
                      </div>
                    </div>
                    <h3 className="font-black text-white text-lg leading-tight mb-1">{item.name}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest line-clamp-2">
                      {item.description || "Sem descrição"}
                    </p>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-slate-800/50 flex justify-between items-end">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Disponível</p>
                      <p className="text-2xl font-black text-violet-400 italic tracking-tighter leading-none">
                        {available} <span className="text-xs text-slate-500 not-italic">/ {item.quantity}</span>
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        title="Excluir Material"
                        className="w-8 h-8 rounded-xl bg-[#0f172a] hover:bg-red-500/10 text-slate-500 hover:text-red-500 border border-slate-800 hover:border-red-500/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-xl transition-all"
                      >
                        <Edit2 size={12} /> Editar
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1a1f2e] border border-slate-800 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-transparent" />
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">
                    {editingId ? "Editar Material" : "Novo Material"}
                  </h2>
                  <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mt-1">Registo no Almoxarifado</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-red-500 p-2 bg-[#0f172a] rounded-xl"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input required placeholder="Nome do Material (Ex: Barraca Igloo)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-white focus:border-violet-500/50 outline-none text-sm font-medium" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block pl-1">Categoria</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-3 text-slate-200 outline-none text-xs font-bold uppercase">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block pl-1">Quantidade</label>
                    <input required type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-3 text-white outline-none text-xs font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block pl-1">Estado</label>
                    <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-3 text-slate-200 outline-none text-xs font-bold uppercase">
                      <option value="NOVO">Novo</option>
                      <option value="BOM">Bom</option>
                      <option value="MANUTENCAO">Manutenção</option>
                      <option value="INUTILIZADO">Inutilizado</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block pl-1">Localização</label>
                    <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Sede..." className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-3 text-white outline-none text-xs font-bold" />
                  </div>
                </div>

                <textarea placeholder="Descrição ou observação opcional..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-white focus:border-violet-500/50 outline-none text-sm font-medium resize-none h-24" />

                <button type="submit" disabled={isSubmitting} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black uppercase tracking-widest text-xs p-4 rounded-2xl disabled:opacity-50 mt-2 shadow-lg shadow-violet-600/20">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : (editingId ? "Atualizar Material" : "Guardar no Inventário")}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, Loader2, X, Package, Tent, Wrench, Utensils, Archive, ArrowRightLeft, ShieldAlert, Trash2, Edit2, Minus, Check } from "lucide-react"

export default function InventarioPage() {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // MODAL DE CADASTRO/EDIÇÃO
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "", description: "", category: "Acampamento", condition: "BOM", quantity: "1", location: "Sede Principal", borrowed: "0", owner: ""
  })

  // MODAL DE EMPRÉSTIMO RÁPIDO
  const [borrowModal, setBorrowModal] = useState<{ item: any, type: 'borrow' | 'return' } | null>(null)
  const [borrowInput, setBorrowInput] = useState("")
  const [selectedReturner, setSelectedReturner] = useState("")

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

  // Extrai todos os responsáveis únicos para criar as "Sugestões Rápidas"
  const allOwners = Array.from(new Set(items.flatMap(item => (item.owner || "").split(',').map((s: string) => s.trim()).filter(Boolean))))

  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({ name: "", description: "", category: "Acampamento", condition: "BOM", quantity: "1", location: "Sede Principal", borrowed: "0", owner: "" })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id)
    setFormData({
      name: item.name, description: item.description || "", category: item.category, condition: item.condition,
      quantity: String(item.quantity), location: item.location || "", borrowed: String(item.borrowed || 0), owner: item.owner || ""
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza que deseja excluir este material permanentemente?")) return
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" })
      if (res.ok) await loadData()
      else alert("Erro ao excluir o item.")
    } catch {
      alert("Erro de conexão ao tentar excluir.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedQuantity = parseInt(formData.quantity) || 1
    const parsedBorrowed = parseInt(formData.borrowed) || 0

    if (parsedBorrowed > parsedQuantity) return alert("A quantidade emprestada não pode ser maior que o total físico disponível!")

    const finalOwner = parsedBorrowed === 0 ? "" : formData.owner
    setIsSubmitting(true)
    const url = editingId ? `/api/inventory/${editingId}` : "/api/inventory"
    const method = editingId ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, quantity: parsedQuantity, borrowed: parsedBorrowed, owner: finalOwner })
      })
      if (res.ok) { setIsModalOpen(false); await loadData() } 
      else alert("Erro ao guardar o material.")
    } catch { alert("Erro de conexão.") } 
    finally { setIsSubmitting(false) }
  }

  const openBorrowModal = (item: any, type: 'borrow' | 'return') => {
    setBorrowModal({ item, type })
    setBorrowInput("")
    
    if (type === 'return') {
      const owners = item.owner ? item.owner.split(',').map((s: string) => s.trim()).filter(Boolean) : []
      if (owners.length === 1) setSelectedReturner(owners[0])
      else setSelectedReturner("")
    }
  }

  const submitBorrowModal = async () => {
    if (!borrowModal) return
    setIsSubmitting(true)
    const { item, type } = borrowModal
    
    const change = type === 'borrow' ? 1 : -1
    const newBorrowed = (item.borrowed || 0) + change
    let newOwner = item.owner || ""

    if (type === 'borrow') {
      const added = borrowInput.trim()
      newOwner = newOwner ? `${newOwner}, ${added}` : added
    } else {
      if (newBorrowed === 0) {
        newOwner = "" 
      } else if (selectedReturner && selectedReturner !== 'KEEP_ALL') {
        const names = newOwner.split(',').map((s: string) => s.trim()).filter(Boolean)
        const idx = names.indexOf(selectedReturner)
        if (idx > -1) names.splice(idx, 1)
        newOwner = names.join(', ')
      }
    }

    setItems(current => current.map(i => i.id === item.id ? { ...i, borrowed: newBorrowed, owner: newOwner } : i))
    setBorrowModal(null) 

    try {
      await fetch(`/api/inventory/${item.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, borrowed: newBorrowed, owner: newOwner })
      })
    } catch (error) {
      alert("Erro de conexão ao atualizar empréstimo.")
      await loadData()
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

  const returnOwnersList = borrowModal?.item.owner ? borrowModal.item.owner.split(',').map((s: string) => s.trim()).filter(Boolean) : []

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 min-h-screen">
      
      {/* CABEÇALHO E DASHBOARD (Mantido) */}
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
              className="bg-[#0f172a] border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-violet-500/50 w-full font-medium transition-all"
            />
          </div>
          
          <button onClick={handleOpenCreate} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg w-full lg:w-auto">
            <Plus size={16} /> Cadastrar Material
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-[#1a1f2e] border border-slate-800 px-4 py-2 rounded-xl"><Package size={14} className="text-slate-400" /><span className="text-xs font-bold text-slate-300">Acervo: {totalItems}</span></div>
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl"><ArrowRightLeft size={14} className="text-amber-500" /><span className="text-xs font-bold text-amber-500">Uso: {totalBorrowed}</span></div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto hide-scrollbar">
          <button onClick={() => setSelectedCategory(null)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${!selectedCategory ? 'bg-[#0f172a] border-slate-600 text-white' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}>Todos</button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${selectedCategory === cat.id ? 'bg-[#0f172a] border-slate-600 text-white' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}>{cat.icon} {cat.id}</button>
          ))}
        </div>
      </div>

      {/* GRID DE MATERIAIS */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-500" size={40} /></div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1f2e] rounded-[32px] border border-slate-800 border-dashed">
          <p className="text-slate-500 font-black uppercase tracking-[0.2em]">Nenhum material encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItems.map(item => {
              const borrowed = item.borrowed || 0
              const available = item.quantity - borrowed
              const isMaintenance = item.condition === 'MANUTENCAO'
              const conditionColor = isMaintenance ? 'text-red-500 border-red-500/30 bg-red-500/10' : item.condition === 'NOVO' ? 'text-amber-400 border-amber-400/30 bg-amber-400/10' : 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'
              
              return (
                <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`bg-[#1a1f2e] border ${isMaintenance ? 'border-red-500/20' : 'border-slate-800'} p-6 rounded-[28px] flex flex-col justify-between h-full shadow-lg hover:border-violet-500/30 transition-colors`}>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="pr-4">
                        <h3 className="font-bold text-white text-lg leading-tight flex flex-col">{item.name} {item.location && <span className="text-[11px] font-medium text-slate-500 mt-1">Sede: {item.location}</span>}</h3>
                      </div>
                      <div className="flex gap-2 items-center shrink-0">
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${conditionColor}`}>{item.condition}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto space-y-4 pt-4">
                    <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                      {borrowed > 0 && <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />}
                      <div className="flex items-center gap-2 mb-1 relative z-10">
                        <p className="text-sm font-bold text-slate-300">Disponibilidade:</p>
                        <p className="text-lg font-black tracking-tight"><span className={available > 0 ? 'text-violet-400' : 'text-red-500'}>[{available}]</span><span className="text-slate-500 text-sm"> / {item.quantity}</span></p>
                      </div>
                      <div className={`w-full border-t border-slate-800/80 mt-3 pt-3 text-center relative z-10 ${borrowed > 0 ? 'border-amber-500/20' : ''}`}>
                        {borrowed > 0 ? (
                          <><p className="text-[11px] font-black text-amber-500 uppercase tracking-widest">{borrowed} Em Uso</p><p className="text-xs font-bold text-amber-500/80 truncate px-2 mt-1">Resp: {item.owner}</p></>
                        ) : (<p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">0 Em Uso</p>)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenEdit(item)} className="w-10 h-10 rounded-xl bg-[#0f172a] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 flex items-center justify-center transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(item.id)} className="w-10 h-10 rounded-xl bg-[#0f172a] border border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-500/30 flex items-center justify-center transition-colors"><Trash2 size={16} /></button>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openBorrowModal(item, 'return')} disabled={borrowed <= 0} className="w-10 h-10 rounded-xl bg-[#0f172a] border border-slate-800 text-amber-500 hover:bg-amber-500/10 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"><Minus size={18} /></button>
                        <button onClick={() => openBorrowModal(item, 'borrow')} disabled={available <= 0} className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/30 text-violet-400 hover:bg-violet-600 hover:text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"><Plus size={18} /></button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL DE EMPRÉSTIMO / DEVOLUÇÃO (COM SELEÇÃO E SCROLL)    */}
      {/* ========================================================= */}
      <AnimatePresence>
        {borrowModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1a1f2e] border border-slate-800 rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* HEADER FIXO DO MODAL */}
              <div className="relative p-6 md:p-8 border-b border-slate-800/50 shrink-0">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${borrowModal.type === 'borrow' ? 'from-amber-500' : 'from-emerald-500'} to-transparent`} />
                <button onClick={() => setBorrowModal(null)} className="absolute top-6 right-6 text-slate-500 hover:text-red-500 p-2 bg-[#0f172a] rounded-xl border border-slate-800 transition-colors"><X size={20} /></button>
                <div className="pr-10">
                  <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">
                    {borrowModal.type === 'borrow' ? "Emprestar Item" : "Devolver Item"}
                  </h2>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 truncate ${borrowModal.type === 'borrow' ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {borrowModal.item.name}
                  </p>
                </div>
              </div>

              {/* CORPO DO MODAL (Com Scroll) */}
              <div className="p-6 md:p-8 overflow-y-auto hide-scrollbar">
                {borrowModal.type === 'borrow' ? (
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                      Nome de quem está a levar (1 unid.)
                    </label>
                    <input autoFocus placeholder="Ex: Patrulha Touro..." value={borrowInput} onChange={e => setBorrowInput(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-amber-500 focus:border-amber-500/50 outline-none text-sm font-bold shadow-inner" />
                    
                    {/* CHIPS DE SUGESTÃO (Caixa de Seleção Rápida) */}
                    {allOwners.length > 0 && (
                      <div className="mt-4">
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2">Sugestões (Baseado no Acervo):</p>
                        <div className="flex flex-wrap gap-2">
                          {allOwners.map((owner, idx) => (
                            <button 
                              key={idx} type="button" onClick={() => setBorrowInput(owner)} 
                              className={`text-[10px] px-3 py-1.5 rounded-lg border transition-all font-bold ${borrowInput === owner ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-[#0f172a] border-slate-800 text-slate-400 hover:text-amber-500 hover:border-amber-500/50'}`}
                            >
                              {owner}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-8 flex gap-3">
                      <button onClick={() => setBorrowModal(null)} className="flex-1 p-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-slate-800 text-slate-400 hover:bg-[#0f172a] transition-colors">Cancelar</button>
                      <button onClick={submitBorrowModal} disabled={isSubmitting || !borrowInput.trim()} className="flex-1 bg-amber-500 hover:bg-amber-600 text-[#0f172a] font-black uppercase tracking-widest text-xs p-4 rounded-2xl disabled:opacity-50 flex justify-center items-center transition-all">
                        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Confirmar (+1)"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-slate-400 mb-4">
                      {returnOwnersList.length > 0 && borrowModal.item.borrowed > 1 ? "Selecione quem está a devolver (1 unid.):" : "Confirmar a devolução de 1 unidade?"}
                    </p>
                    
                    {/* CAIXA DE SELEÇÃO DE DEVOLUÇÃO */}
                    <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar bg-[#0f172a]/50 p-2 rounded-2xl border border-slate-800/50">
                      {returnOwnersList.map((name: string, idx: number) => (
                        <button key={idx} onClick={() => setSelectedReturner(name)} className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${selectedReturner === name ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-sm' : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:border-slate-600'}`}>
                          <span className="font-bold text-sm">{name}</span>
                          {selectedReturner === name && <Check size={16} />}
                        </button>
                      ))}
                      
                      {borrowModal.item.borrowed > 1 && (
                        <button onClick={() => setSelectedReturner('KEEP_ALL')} className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between mt-2 ${selectedReturner === 'KEEP_ALL' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-sm' : 'bg-[#0f172a] border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                          <span className="font-bold text-sm italic">Apenas reduzir Qtd. (Manter nomes)</span>
                          {selectedReturner === 'KEEP_ALL' && <Check size={16} />}
                        </button>
                      )}
                    </div>

                    <div className="mt-8 flex gap-3">
                      <button onClick={() => setBorrowModal(null)} className="flex-1 p-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-slate-800 text-slate-400 hover:bg-[#0f172a] transition-colors">Cancelar</button>
                      <button onClick={submitBorrowModal} disabled={isSubmitting || (returnOwnersList.length > 0 && borrowModal.item.borrowed > 1 && !selectedReturner)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-[#0f172a] font-black uppercase tracking-widest text-xs p-4 rounded-2xl disabled:opacity-50 flex justify-center items-center transition-all">
                        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Confirmar (-1)"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL GERAL: CADASTRO/EDIÇÃO COMPLETA (Tmb Atualizado)    */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1a1f2e] border border-slate-800 rounded-[32px] w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
              
              <div className="relative p-6 md:p-8 border-b border-slate-800/50 shrink-0">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-transparent" />
                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-red-500 p-2 bg-[#0f172a] rounded-xl border border-slate-800 transition-colors"><X size={20} /></button>
                <div className="pr-10">
                  <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">{editingId ? "Editar Material" : "Novo Material"}</h2>
                  <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mt-1">Registo no Almoxarifado</p>
                </div>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto hide-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <input required placeholder="Nome do Material (Ex: Barraca)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-white focus:border-violet-500/50 outline-none text-sm font-medium" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block pl-1">Categoria</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-3 text-slate-200 outline-none text-xs font-bold uppercase">{categories.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}</select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block pl-1">Estado</label>
                      <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-3 text-slate-200 outline-none text-xs font-bold uppercase">
                        <option value="NOVO">Novo</option><option value="BOM">Bom</option><option value="MANUTENCAO">Manutenção</option><option value="INUTILIZADO">Inutilizado</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block pl-1">Qtd. Total Físico</label>
                      <input required type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-3 text-white outline-none text-xs font-bold focus:border-violet-500/50" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block pl-1">Qtd. Emprestada</label>
                      <input required type="number" min="0" max={formData.quantity} value={formData.borrowed} onChange={e => setFormData({...formData, borrowed: e.target.value})} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-3 text-amber-500 outline-none text-xs font-bold focus:border-amber-500/50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block pl-1">Localização</label>
                      <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Armário 2..." className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-3 text-white outline-none text-xs font-bold focus:border-violet-500/50" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block pl-1">Para quem? (Nome)</label>
                      <input value={formData.owner} onChange={e => setFormData({...formData, owner: e.target.value})} placeholder="Ex: Patrulha..." className="w-full bg-[#0f172a] border border-amber-500/30 rounded-xl p-3 text-amber-500 outline-none text-xs font-bold focus:border-amber-500/50" />
                    </div>
                  </div>

                  <textarea placeholder="Descrição ou observação opcional..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-white focus:border-violet-500/50 outline-none text-sm font-medium resize-none h-16" />

                  <button type="submit" disabled={isSubmitting} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black uppercase tracking-widest text-xs p-4 rounded-2xl disabled:opacity-50 mt-2 shadow-lg transition-all">
                    {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : (editingId ? "Atualizar Material" : "Guardar no Inventário")}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
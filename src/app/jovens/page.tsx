"use client"

import { useEffect, useState } from "react"
import { Loader2, PlusCircle, X, Filter, User, Phone, Printer, Trash2, Search, Calendar } from "lucide-react"
import Image from "next/image"
import CarneVirtual from "@/components/CarneVirtual"

export default function JovensPage() {
  const [youths, setYouths] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewingYouth, setViewingYouth] = useState<any | null>(null)
  const [printingFee, setPrintingFee] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "", age: "", branch: "Lobinho", guardianName: "", guardianPhone: ""
  })

  const branches = [
    { id: "Lobinho", img: "/Logo_ramo_lobinho_principal.png", color: "border-yellow-500/30 text-yellow-500" },
    { id: "Escoteiro", img: "/Logo_ramo_escoteiro_principal.png", color: "border-green-500/30 text-green-500" },
    { id: "Sênior", img: "/Logo_ramo_senior_principal.png", color: "border-red-800/30 text-red-800" },
    { id: "Pioneiro", img: "/Logo_ramo_pioneiro_principal.png", color: "border-red-600/30 text-red-600" },
  ]

  async function loadYouths() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/youth")
      const data = await res.json()
      setYouths(data || [])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadYouths() }, [])

  async function handleDeleteYouth(id: string) {
    if (!confirm("Excluir este jovem apagará todos os dados permanentemente. Continuar?")) return
    const res = await fetch(`/api/youth/${id}`, { method: "DELETE" })
    if (res.ok) { setViewingYouth(null); loadYouths(); }
  }

  const filteredYouths = youths.filter(y => {
    const matchesBranch = selectedBranch ? y.branch === selectedBranch : true;
    const matchesSearch = 
      y.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      y.guardians?.some((g: any) => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesBranch && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 min-h-screen">
      
      {/* HEADER PRINCIPAL */}
      <div className="bg-[#1a1f2e] p-8 rounded-[32px] border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Membros Juvenis</h1>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1">107º Grupo Escoteiro Padre Roma</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Buscar por jovem ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0f172a] border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 w-full md:w-80 transition-all font-medium"
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <PlusCircle size={18} /> Novo Jovem
          </button>
        </div>
      </div>

      {/* FILTROS DE RAMO */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button 
          onClick={() => setSelectedBranch(null)}
          className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-black uppercase text-[10px] tracking-widest ${!selectedBranch ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-slate-800 bg-[#1a1f2e] text-slate-500 hover:border-slate-700'}`}
        >
          <Filter size={16} /> Todos
        </button>
        {branches.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBranch(b.id)}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${selectedBranch === b.id ? `bg-emerald-500/5 border-emerald-500 text-emerald-500 shadow-lg` : 'border-slate-800 bg-[#1a1f2e] text-slate-400 hover:border-slate-600'}`}
          >
            <div className="relative w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity">
              <Image src={b.img} alt={b.id} fill className="object-contain" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{b.id}</span>
          </button>
        ))}
      </div>

      {/* TABELA DE MEMBROS */}
      <div className="bg-[#1a1f2e] rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0f172a]/50 text-slate-500 uppercase text-[10px] font-black tracking-[0.2em] border-b border-slate-800">
              <tr>
                <th className="px-10 py-6">Membro</th>
                <th className="px-10 py-6">Idade</th>
                <th className="px-10 py-6 text-right">Ramo / Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={32} /></td></tr>
              ) : filteredYouths.length === 0 ? (
                <tr><td colSpan={3} className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest">Nenhum jovem encontrado</td></tr>
              ) : filteredYouths.map((y) => (
                <tr 
                  key={y.id} 
                  className="group hover:bg-[#1e293b]/50 cursor-pointer transition-all"
                  onClick={() => fetch(`/api/youth/${y.id}`).then(r => r.json()).then(data => setViewingYouth(data))}
                >
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#0f172a] border border-slate-800 flex items-center justify-center text-slate-600 group-hover:text-emerald-500 transition-all">
                        <User size={22} />
                      </div>
                      <div>
                        <p className="font-black text-slate-100 text-base uppercase tracking-tight">{y.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 italic">Efetivo Ativo</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-slate-400 font-bold italic">{y.age} anos</td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-6">
                      <span className="px-4 py-1.5 rounded-xl bg-[#0f172a] border border-slate-800 text-[10px] font-black text-slate-400 uppercase">
                        {y.branch}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteYouth(y.id); }}
                        className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE DETALHES (TEMA DARK) */}
      {viewingYouth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 border-b border-slate-800 flex justify-between items-start bg-[#0f172a]/50">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20"><User size={32} /></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tighter italic">{viewingYouth.name}</h2>
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-[0.2em] mt-2">{viewingYouth.branch} • {viewingYouth.age} Anos</p>
                </div>
              </div>
              <button onClick={() => setViewingYouth(null)} className="p-3 text-slate-500 hover:bg-[#1e293b] rounded-full transition-all"><X size={24} /></button>
            </div>
            
            <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-6">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Responsáveis</h3>
                {viewingYouth.guardians?.map((g: any) => (
                  <div key={g.id} className="p-5 rounded-3xl bg-[#0f172a] border border-slate-800 flex justify-between items-center group">
                    <div>
                      <p className="font-bold text-slate-200">{g.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-2 font-medium"><Phone size={12} /> {g.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="md:col-span-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Histórico de Mensalidades</h3>
                <div className="rounded-[28px] border border-slate-800 overflow-hidden bg-[#0f172a] shadow-inner">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-900/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <tr><th className="px-6 py-4">Mês/Ano</th><th className="px-6 py-4 text-center">Status / Ações</th><th className="px-6 py-4 text-right">Valor</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {viewingYouth.fees?.map((f: any) => (
                        <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-200 italic">{String(f.month).padStart(2,'0')}/{f.year}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${f.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                {f.status === 'paid' ? 'Liquidado' : 'Aberto'}
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setPrintingFee(f)} className="p-2 text-slate-400 hover:text-emerald-500 rounded-lg"><Printer size={16} /></button>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-black text-slate-100">R$ {f.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-8 bg-[#0f172a]/50 border-t border-slate-800 flex justify-end">
              <button onClick={() => setViewingYouth(null)} className="px-10 py-3 bg-[#1e293b] hover:bg-slate-700 text-slate-300 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all shadow-lg border border-slate-800">Fechar Janela</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO (TEMA DARK) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3 text-emerald-500">
                <PlusCircle size={24} />
                <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tighter italic">Novo Jovem</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-500 hover:bg-[#1e293b] rounded-full"><X size={24} /></button>
            </div>
            
            <form className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Dados do Membro</label>
                <input type="text" required placeholder="Nome Completo" className="w-full bg-[#0f172a] border border-slate-800 p-4 rounded-2xl outline-none focus:border-emerald-500/50 text-slate-100 font-bold placeholder:text-slate-600 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Idade</label>
                   <input type="number" required placeholder="00" className="w-full bg-[#0f172a] border border-slate-800 p-4 rounded-2xl outline-none focus:border-emerald-500/50 text-slate-100 font-bold transition-all" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Ramo</label>
                   <select className="w-full bg-[#0f172a] border border-slate-800 p-4 rounded-2xl outline-none focus:border-emerald-500/50 text-slate-100 font-bold transition-all appearance-none cursor-pointer">
                      <option value="Lobinho">Lobinho</option><option value="Escoteiro">Escoteiro</option><option value="Sênior">Sênior</option><option value="Pioneiro">Pioneiro</option>
                   </select>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Responsável Direto</label>
                <input type="text" required placeholder="Nome do Pai/Mãe" className="w-full bg-[#0f172a] border border-slate-800 p-4 rounded-2xl outline-none focus:border-emerald-500/50 text-slate-100 font-bold placeholder:text-slate-600 transition-all" />
              </div>

              <input type="tel" required placeholder="Telefone de Contato" className="w-full bg-[#0f172a] border border-slate-800 p-4 rounded-2xl outline-none focus:border-emerald-500/50 text-slate-100 font-bold placeholder:text-slate-600 transition-all" />

              <button className="w-full bg-emerald-500 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20 mt-6 hover:bg-emerald-600 transition-all active:scale-95">Finalizar Cadastro</button>
            </form>
          </div>
        </div>
      )}

      {printingFee && <CarneVirtual fee={printingFee} youth={viewingYouth} onClose={() => setPrintingFee(null)} />}
    </div>
  )
}
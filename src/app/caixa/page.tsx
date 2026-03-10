"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, Search, Plus, TrendingUp, TrendingDown, Loader2, X, Filter, Download, Tent, FileSpreadsheet } from "lucide-react"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"

export default function CaixaPage() {
  const [youths, setYouths] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedYouth, setSelectedYouth] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("credit")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [activityName, setActivityName] = useState("")
  const [activityCost, setActivityCost] = useState("")

  const branches = ["Lobinho", "Escoteiro", "Sênior", "Pioneiro"]

  async function loadData() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/youth")
      const data = await res.json()
      setYouths(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const getBalance = (funds: any[] = []) => {
    return funds.reduce((acc, curr) => {
      return curr.type === 'credit' ? acc + curr.amount : acc - curr.amount
    }, 0)
  }

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const res = await fetch("/api/funds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youthId: selectedYouth, amount, description, type })
    })

    if (res.ok) {
      setIsModalOpen(false)
      setAmount("")
      setDescription("")
      await loadData()
    }
    setIsSubmitting(false)
  }

  const filteredYouths = youths.filter(y => {
    const matchesSearch = y.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBranch = selectedBranch ? y.branch === selectedBranch : true
    return matchesSearch && matchesBranch
  })

  const handleExportSaldos = async () => {
    if (filteredYouths.length === 0) return alert("Nenhum jovem encontrado.")
    setIsExporting(true)
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Saldos Caixa Individual')

      worksheet.columns = [
        { header: 'NOME DO JOVEM', key: 'youth', width: 40 },
        { header: 'RAMO', key: 'branch', width: 18 },
        { header: 'SALDO DISPONÍVEL', key: 'balance', width: 25 }
      ]

      const headerRow = worksheet.getRow(1)
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 12 }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
      })
      headerRow.height = 30

      let totalRetido = 0
      filteredYouths.forEach(youth => {
        const balance = getBalance(youth.funds)
        totalRetido += balance
        const row = worksheet.addRow({ youth: youth.name, branch: youth.branch, balance: balance })
        row.alignment = { vertical: 'middle' }
        row.getCell('branch').alignment = { horizontal: 'center' }
        row.getCell('balance').numFmt = '"R$" #,##0.00'
        row.getCell('balance').font = { color: { argb: balance > 0 ? 'FF059669' : 'FF64748B' }, bold: balance > 0 }
      })

      const totalRow = worksheet.addRow({ youth: '', branch: 'TOTAL RETIDO:', balance: totalRetido })
      totalRow.height = 25
      totalRow.getCell('branch').font = { bold: true, size: 12 }
      totalRow.getCell('branch').alignment = { horizontal: 'right', vertical: 'middle' }
      totalRow.getCell('balance').numFmt = '"R$" #,##0.00'
      totalRow.getCell('balance').font = { color: { argb: 'FF059669' }, bold: true, size: 14 }
      
      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(new Blob([buffer]), `Saldos_Caixa_${selectedBranch || 'Geral'}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (filteredYouths.length === 0) return alert("Nenhum jovem encontrado.")
    
    setIsSubmitting(true)
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Planejamento de Atividade')

      worksheet.columns = [
        { header: 'JOVEM', key: 'youth', width: 35 },
        { header: 'RAMO', key: 'branch', width: 15 },
        { header: 'SALDO ATUAL', key: 'balance', width: 20 },
        { header: 'DESCONTO (CAIXA)', key: 'discount', width: 22 },
        { header: 'VALOR A PAGAR', key: 'toPay', width: 22 },
        { header: 'SALDO RESTANTE', key: 'remaining', width: 20 }
      ]

      const headerRow = worksheet.getRow(1)
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }
        cell.font = { color: { argb: 'FF000000' }, bold: true, size: 12 }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
      })
      headerRow.height = 30

      const cost = Number(activityCost)
      let totalPagarPais = 0
      let totalDescontoCaixa = 0

      filteredYouths.forEach(youth => {
        const balance = getBalance(youth.funds)
        const availableForDiscount = Math.max(0, balance)
        const discountApplied = Math.min(availableForDiscount, cost)
        const amountToPay = cost - discountApplied
        const remainingBalance = balance - discountApplied

        totalPagarPais += amountToPay
        totalDescontoCaixa += discountApplied

        const row = worksheet.addRow({
          youth: youth.name,
          branch: youth.branch,
          balance: balance,
          discount: discountApplied,
          toPay: amountToPay,
          remaining: remainingBalance
        })

        row.alignment = { vertical: 'middle' }
        row.getCell('branch').alignment = { horizontal: 'center' }
        
        ;['balance', 'discount', 'toPay', 'remaining'].forEach(col => {
          row.getCell(col).numFmt = '"R$" #,##0.00'
        })

        row.getCell('discount').font = { color: { argb: discountApplied > 0 ? 'FF3B82F6' : 'FF64748B' } }
        row.getCell('toPay').font = { color: { argb: amountToPay === 0 ? 'FF059669' : 'FFDC2626' }, bold: true }
        row.getCell('remaining').font = { color: { argb: remainingBalance > 0 ? 'FF059669' : 'FF64748B' } }
      })

      worksheet.addRow({})
      
      const summaryHeaderRow = worksheet.addRow({ youth: `RESUMO FINANCEIRO: ${activityName.toUpperCase()}` })
      summaryHeaderRow.font = { bold: true, size: 14 }
      
      worksheet.addRow({ youth: 'Custo por Jovem:', branch: cost }).getCell('branch').numFmt = '"R$" #,##0.00'
      worksheet.addRow({ youth: 'Total a receber (Dinheiro/PIX):', branch: totalPagarPais }).getCell('branch').numFmt = '"R$" #,##0.00'
      worksheet.addRow({ youth: 'Total transferido do Caixa Indiv.:', branch: totalDescontoCaixa }).getCell('branch').numFmt = '"R$" #,##0.00'

      const buffer = await workbook.xlsx.writeBuffer()
      const safeName = activityName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      saveAs(new Blob([buffer]), `Simulacao_${safeName}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`)
      
      setIsActivityModalOpen(false)
      setActivityName("")
      setActivityCost("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 min-h-screen">
      
      <div className="bg-[#1a1f2e] p-8 rounded-[32px] border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center xl:text-left w-full xl:w-auto">
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Caixa Individual</h1>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1 flex items-center justify-center xl:justify-start gap-2">
            <Wallet size={14} className="text-emerald-500" /> Fundos de Campanhas e Rifas
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 w-full xl:w-auto relative z-10 justify-end items-center">
          <div className="relative group w-full lg:w-64 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Buscar escoteiro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0f172a] border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 w-full font-medium transition-all"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap sm:flex-nowrap w-full lg:w-auto justify-center lg:justify-end">
            <button 
              onClick={() => setIsActivityModalOpen(true)}
              className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 px-4 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg flex-1 sm:flex-none whitespace-nowrap"
              title="Planejar Acampamento / Atividade"
            >
              <Tent size={16} /> <span className="hidden sm:inline">Simular</span>
            </button>

            <button 
              onClick={handleExportSaldos}
              disabled={isExporting}
              className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-500 px-4 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all flex-1 sm:flex-none whitespace-nowrap"
              title="Baixar planilha de saldos"
            >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
              <span className="hidden sm:inline">Saldos</span>
            </button>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg flex-1 sm:flex-none whitespace-nowrap"
            >
              <Plus size={16} /> Lançar Valor
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-[#0f172a] p-2 rounded-2xl border border-slate-800 overflow-x-auto w-fit mx-auto md:mx-0 shadow-lg hide-scrollbar">
        <div className="pl-3 pr-2 text-slate-600">
          <Filter size={16} />
        </div>
        
        <div className="flex gap-1 relative">
          <button
            onClick={() => setSelectedBranch(null)}
            className={`relative px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors z-10 ${!selectedBranch ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {!selectedBranch && <motion.div layoutId="activeFilterCaixa" className="absolute inset-0 bg-[#1a1f2e] border border-slate-700/50 rounded-xl shadow-md -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
            Todos
          </button>

          {branches.map(branch => (
            <button
              key={branch}
              onClick={() => setSelectedBranch(branch)}
              className={`relative px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors z-10 ${selectedBranch === branch ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {selectedBranch === branch && <motion.div layoutId="activeFilterCaixa" className="absolute inset-0 bg-[#1a1f2e] border border-slate-700/50 rounded-xl shadow-md -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
              {branch}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
      ) : filteredYouths.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-[#1a1f2e] rounded-[32px] border border-slate-800 border-dashed">
          <p className="text-slate-500 font-black uppercase tracking-[0.2em]">Nenhum jovem encontrado</p>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredYouths.map((youth) => {
              const balance = getBalance(youth.funds)
              return (
                <motion.div key={youth.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="bg-[#1a1f2e] border border-slate-800 p-6 rounded-[28px] hover:border-emerald-500/30 transition-all group shadow-xl flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-black text-slate-100 uppercase tracking-tight leading-tight">{youth.name}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        Ramo <span className="text-emerald-500 italic">{youth.branch}</span>
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors ${balance > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-[#0f172a] border-slate-800 text-slate-600 group-hover:text-emerald-500'}`}>
                      <Wallet size={18} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Saldo Disponível</p>
                    <p className={`text-3xl font-black italic tracking-tighter transition-colors ${balance > 0 ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'}`}>
                      R$ {balance.toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {isActivityModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1a1f2e] border border-slate-800 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-transparent" />
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Simular Evento</h2>
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">Descontos do Caixa Individual</p>
                </div>
                <button onClick={() => setIsActivityModalOpen(false)} className="text-slate-500 hover:text-red-500 transition-colors p-2 bg-[#0f172a] border border-slate-800 rounded-xl"><X size={20} /></button>
              </div>

              <form onSubmit={handleExportActivity} className="space-y-5 relative z-10">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Nome da Atividade</label>
                  <input required type="text" value={activityName} onChange={e => setActivityName(e.target.value)} placeholder="Ex: Acampamento de Grupo" className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-slate-200 focus:border-amber-500/50 outline-none text-sm font-medium transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Valor por Escoteiro (R$)</label>
                  <input required type="number" step="0.01" min="0" value={activityCost} onChange={e => setActivityCost(e.target.value)} placeholder="0.00" className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-white text-xl font-black italic focus:border-amber-500/50 outline-none transition-all" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 hover:bg-amber-600 text-[#0f172a] font-black uppercase tracking-widest text-xs p-4 rounded-2xl transition-all disabled:opacity-50 mt-4 shadow-lg flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : <><FileSpreadsheet size={18} /> Gerar Planilha Excel</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-[#1a1f2e] border border-slate-800 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent" />
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Novo Lançamento</h2>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Campanhas Financeiras</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-red-500 transition-colors p-2 bg-[#0f172a] border border-slate-800 rounded-xl"><X size={20} /></button>
              </div>

              <form onSubmit={handleTransaction} className="space-y-5 relative z-10">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Selecionar Jovem</label>
                  <select required value={selectedYouth} onChange={e => setSelectedYouth(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-slate-200 focus:border-emerald-500/50 outline-none uppercase text-xs font-bold transition-all">
                    <option value="">Selecione...</option>
                    {youths.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setType('credit')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${type === 'credit' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-slate-800 bg-[#0f172a] text-slate-500 hover:border-slate-700'}`}>
                    <TrendingUp size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Entrada</span>
                  </button>
                  <button type="button" onClick={() => setType('debit')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${type === 'debit' ? 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'border-slate-800 bg-[#0f172a] text-slate-500 hover:border-slate-700'}`}>
                    <TrendingDown size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Saída / Uso</span>
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Valor (R$)</label>
                  <input required type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-white text-xl font-black italic focus:border-emerald-500/50 outline-none transition-all" />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Descrição (Ex: Rifa de Páscoa)</label>
                  <input required type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Motivo do lançamento..." className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-slate-200 focus:border-emerald-500/50 outline-none text-sm font-medium transition-all" />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs p-4 rounded-2xl transition-all disabled:opacity-50 mt-4">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Confirmar Lançamento"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
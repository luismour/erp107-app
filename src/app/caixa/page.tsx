"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, Search, Plus, TrendingUp, TrendingDown, Loader2, X, Filter, Download, Tent, FileSpreadsheet, CheckSquare, Layers } from "lucide-react"
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

  const [selectedYouths, setSelectedYouths] = useState<string[]>([])
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false)
  const [batchData, setBatchData] = useState({
    amount: "",
    type: "credit",
    description: ""
  })

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
      return curr.type === 'credit' ? acc + Number(curr.amount) : acc - Number(curr.amount)
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

  const handleSelectYouth = (id: string) => {
    setSelectedYouths(prev => 
      prev.includes(id) ? prev.filter(yId => yId !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (filteredList: any[]) => {
    if (selectedYouths.length === filteredList.length) {
      setSelectedYouths([]) 
    } else {
      setSelectedYouths(filteredList.map(y => y.id)) 
    }
  }

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedYouths.length === 0) return alert("Selecione pelo menos um jovem.")
    
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/funds/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youthIds: selectedYouths,
          amount: batchData.amount,
          type: batchData.type,
          description: batchData.description
        })
      })

      if (res.ok) {
        setIsBatchModalOpen(false)
        setSelectedYouths([])
        setBatchData({ amount: "", type: "credit", description: "" })
        await loadData()
        alert("Lançamento em lote efetuado com sucesso!")
      } else {
        const err = await res.json()
        alert(`Erro: ${err.error}`)
      }
    } catch (error) {
      alert("Erro de conexão ao tentar fazer o lançamento em lote.")
    } finally {
      setIsSubmitting(false)
    }
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
        row.getCell('balance').font = { color: { argb: balance > 0 ? 'FF059669' : 'FFEF4444' }, bold: balance !== 0 }
      })

      const totalRow = worksheet.addRow({ youth: '', branch: 'TOTAL DO GRUPO:', balance: totalRetido })
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
        row.getCell('remaining').font = { color: { argb: remainingBalance > 0 ? 'FF059669' : 'FFEF4444' } }
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
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 min-h-screen transition-colors duration-300">
      
      {/* CABEÇALHO */}
      <div className="bg-white dark:bg-[#1a1f2e] p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center xl:text-left w-full xl:w-auto">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase transition-colors">Caixa Individual</h1>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1 flex items-center justify-center xl:justify-start gap-2">
            <Wallet size={14} className="text-emerald-600 dark:text-emerald-500" /> Fundos de Campanhas e Acampamentos
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 w-full xl:w-auto relative z-10 justify-end items-center">
          
          <div className="relative group w-full lg:w-64 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Buscar escoteiro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 w-full font-medium transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap sm:flex-nowrap w-full lg:w-auto justify-center lg:justify-end">

            {/* BOTÃO LOTE */}
            <button 
              onClick={() => setIsBatchModalOpen(true)}
              disabled={selectedYouths.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none whitespace-nowrap"
              title="Lançamento em Lote para os selecionados"
            >
              <Layers size={16} /> <span className="hidden sm:inline">Lote</span> {selectedYouths.length > 0 && `(${selectedYouths.length})`}
            </button>

            {/* BOTÃO SIMULAR */}
            <button 
              onClick={() => setIsActivityModalOpen(true)}
              className="bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-500 px-4 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-sm dark:shadow-lg flex-1 sm:flex-none whitespace-nowrap"
              title="Planejar Acampamento / Atividade"
            >
              <Tent size={16} /> <span className="hidden sm:inline">Simular</span>
            </button>

            {/* BOTÃO EXPORTAR SALDOS */}
            <button 
              onClick={handleExportSaldos}
              disabled={isExporting}
              className="bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-sm dark:shadow-none flex-1 sm:flex-none whitespace-nowrap"
              title="Baixar planilha de saldos"
            >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
              <span className="hidden sm:inline">Saldos</span>
            </button>

            {/* BOTÃO LANÇAR (INDIVIDUAL) */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex-1 sm:flex-none whitespace-nowrap"
            >
              <Plus size={16} /> Lançar
            </button>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTRO DOS RAMOS */}
      <div className="flex items-center gap-4 bg-white dark:bg-[#0f172a] p-2 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto w-fit mx-auto md:mx-0 shadow-sm dark:shadow-lg hide-scrollbar transition-colors">
        <div className="pl-3 pr-2 text-slate-400 dark:text-slate-600">
          <Filter size={16} />
        </div>
        
        <div className="flex gap-1 relative">
          <button
            onClick={() => setSelectedBranch(null)}
            className={`relative px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors z-10 ${!selectedBranch ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            {!selectedBranch && <motion.div layoutId="activeFilterCaixa" className="absolute inset-0 bg-slate-100 dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-sm dark:shadow-md -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
            Todos
          </button>

          {branches.map(branch => (
            <button
              key={branch}
              onClick={() => setSelectedBranch(branch)}
              className={`relative px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors z-10 ${selectedBranch === branch ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            >
              {selectedBranch === branch && <motion.div layoutId="activeFilterCaixa" className="absolute inset-0 bg-slate-100 dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-sm dark:shadow-md -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
              {branch}
            </button>
          ))}
        </div>
      </div>

      {/* SELECIONAR TODOS (Checkbox) */}
      {!isLoading && filteredYouths.length > 0 && (
        <div className="flex justify-end px-2 mb-4 relative z-10">
          <button 
            onClick={() => handleSelectAll(filteredYouths)}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors uppercase tracking-widest bg-white dark:bg-[#0f172a]/50 py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm dark:shadow-none"
          >
            <span className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedYouths.length === filteredYouths.length ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent'}`}>
              <CheckSquare size={12} />
            </span>
            {selectedYouths.length === filteredYouths.length ? "Desmarcar Todos" : "Selecionar Todos"}
          </button>
        </div>
      )}

      {/* GRID DE CARTÕES DO CAIXA INDIVIDUAL */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
      ) : filteredYouths.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white dark:bg-[#1a1f2e] rounded-[32px] border border-slate-200 dark:border-slate-800 border-dashed transition-colors">
          <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">Nenhum jovem encontrado</p>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredYouths.map((youth) => {
              const balance = getBalance(youth.funds)
              const isSelected = selectedYouths.includes(youth.id)

              return (
                <motion.div 
                  key={youth.id} 
                  layout 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.8 }} 
                  onClick={() => handleSelectYouth(youth.id)} // Clicar no cartão inteiro seleciona
                  className={`relative bg-white dark:bg-[#1a1f2e] border p-6 rounded-[28px] transition-all group shadow-sm dark:shadow-xl flex flex-col justify-between cursor-pointer
                    ${isSelected ? 'border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/30'}
                  `}
                >
                  <div className="absolute top-4 right-4 z-10">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${isSelected ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 text-white' : 'bg-slate-50 dark:bg-[#0f172a] border-slate-300 dark:border-slate-700 text-transparent group-hover:border-slate-400 dark:group-hover:border-slate-500'}`}>
                      <CheckSquare size={14} />
                    </div>
                  </div>

                  <div className="flex justify-between items-start mb-6">
                    <div className="pr-6">
                      <h3 className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight leading-tight transition-colors">{youth.name}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        Ramo <span className={`${isSelected ? 'text-blue-600 dark:text-blue-500' : 'text-emerald-600 dark:text-emerald-500'} italic`}>{youth.branch}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-end transition-colors">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Saldo Disponível</p>
                      <p className={`text-3xl font-black italic tracking-tighter transition-colors ${balance > 0 ? 'text-emerald-600 dark:text-emerald-400' : balance < 0 ? 'text-red-600 dark:text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                        R$ {balance.toFixed(2)}
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors ${balance > 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-500' : balance < 0 ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500' : 'bg-slate-50 dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'}`}>
                      <Wallet size={18} />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SIMULAR EVENTO                                                       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isActivityModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden transition-colors"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-transparent" />
              
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase transition-colors">Simular Evento</h2>
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mt-1">Descontos do Caixa</p>
                </div>
                <button onClick={() => setIsActivityModalOpen(false)} className="text-slate-500 hover:text-red-500 transition-colors p-2 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl"><X size={20} /></button>
              </div>

              <form onSubmit={handleExportActivity} className="space-y-5 relative z-10">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Nome da Atividade</label>
                  <input required type="text" value={activityName} onChange={e => setActivityName(e.target.value)} placeholder="Ex: Acampamento Regional" className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-slate-200 focus:border-amber-500/50 outline-none text-sm font-medium transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Custo por Jovem (R$)</label>
                  <input required type="number" step="0.01" min="0" value={activityCost} onChange={e => setActivityCost(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white text-xl font-black italic focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 hover:bg-amber-600 text-white dark:text-[#0f172a] font-black uppercase tracking-widest text-xs p-4 rounded-2xl transition-all disabled:opacity-50 mt-4 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : <><FileSpreadsheet size={18} /> Gerar Excel</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: LANÇAMENTO INDIVIDUAL                                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden transition-colors"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent" />
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase transition-colors">Lançamento</h2>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mt-1">Conta Individual</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-red-500 transition-colors p-2 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl"><X size={20} /></button>
              </div>

              <form onSubmit={handleTransaction} className="space-y-5 relative z-10">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Jovem</label>
                  <select required value={selectedYouth} onChange={e => setSelectedYouth(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-slate-200 focus:border-emerald-500/50 outline-none uppercase text-xs font-bold transition-all">
                    <option value="">Selecione...</option>
                    {youths.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setType('credit')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${type === 'credit' ? 'border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <TrendingUp size={24} /> <span className="text-[10px] font-black uppercase tracking-widest">Entrada (+)</span>
                  </button>
                  <button type="button" onClick={() => setType('debit')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${type === 'debit' ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <TrendingDown size={24} /> <span className="text-[10px] font-black uppercase tracking-widest">Saída (-)</span>
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Valor (R$)</label>
                  <input required type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white text-xl font-black italic focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Descrição</label>
                  <input required type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Motivo..." className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-slate-200 focus:border-emerald-500/50 outline-none text-sm font-medium transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                </div>
                
                <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs p-4 rounded-2xl transition-all disabled:opacity-50 mt-4 shadow-lg shadow-emerald-500/20">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Confirmar Lançamento"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: LANÇAMENTO EM LOTE                                                   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isBatchModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden transition-colors"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent" />
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase transition-colors">Lote: {selectedYouths.length} Jovens</h2>
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest mt-1">Lançamento em Massa</p>
                </div>
                <button onClick={() => setIsBatchModalOpen(false)} className="text-slate-500 hover:text-red-500 transition-colors p-2 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl"><X size={20} /></button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4 mb-6 relative z-10 transition-colors">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 text-center">
                  O valor abaixo será aplicado à conta de <strong>cada um</strong> dos {selectedYouths.length} jovens selecionados.
                </p>
              </div>
              
              <form onSubmit={handleBatchSubmit} className="space-y-5 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setBatchData({...batchData, type: 'credit'})} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${batchData.type === 'credit' ? 'border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <TrendingUp size={24} /> <span className="text-[10px] font-black uppercase tracking-widest">Entrada (+)</span>
                  </button>
                  <button type="button" onClick={() => setBatchData({...batchData, type: 'debit'})} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${batchData.type === 'debit' ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <TrendingDown size={24} /> <span className="text-[10px] font-black uppercase tracking-widest">Saída (-)</span>
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Valor por Jovem (R$)</label>
                  <input required type="number" step="0.01" min="0.01" value={batchData.amount} onChange={e => setBatchData({...batchData, amount: e.target.value})} placeholder="0.00" className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white text-xl font-black italic focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Descrição (Ex: Acampamento)</label>
                  <input required type="text" value={batchData.description} onChange={e => setBatchData({...batchData, description: e.target.value})} placeholder="Acampamento de Grupo..." className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-slate-200 focus:border-blue-500/50 outline-none text-sm font-medium transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs p-4 rounded-2xl disabled:opacity-50 mt-4 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : <><Layers size={16} /> Aplicar em Lote</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
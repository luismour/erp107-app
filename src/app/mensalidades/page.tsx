"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Loader2, CheckCircle, AlertCircle, Clock, Filter, FileText, Check, BookOpen, Download, X, QrCode, PlusCircle } from "lucide-react"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import CarneVirtual from "@/components/CarneVirtual"

export default function MensalidadesPage() {
  const [fees, setFees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [isGeneratingMonthly, setIsGeneratingMonthly] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [monthFilter, setMonthFilter] = useState("ALL")
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString())

  const [isCarneModalOpen, setIsCarneModalOpen] = useState(false)
  const [selectedCarneYouth, setSelectedCarneYouth] = useState("")
  const [carneYear, setCarneYear] = useState(new Date().getFullYear().toString())
  const [isGenerating, setIsGenerating] = useState(false)

  const [carneVirtualFee, setCarneVirtualFee] = useState<any | null>(null)

  const months = [
    { value: "1", label: "Janeiro" }, { value: "2", label: "Fevereiro" }, { value: "3", label: "Março" },
    { value: "4", label: "Abril" }, { value: "5", label: "Maio" }, { value: "6", label: "Junho" },
    { value: "7", label: "Julho" }, { value: "8", label: "Agosto" }, { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" }, { value: "11", label: "Novembro" }, { value: "12", label: "Dezembro" }
  ]

  async function loadData() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/fees")
      const data = await res.json()
      setFees(Array.isArray(data) ? data : [])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const getComputedStatus = (fee: any) => {
    if (fee.status === 'paid') return 'paid'
    
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const dueDate = new Date(fee.dueDate)
    dueDate.setUTCHours(0, 0, 0, 0)
    
    if (dueDate < today) return 'overdue'
    return 'pending'
  }

  const uniqueYouths = Array.from(
    new Map(fees.filter(f => f.youth).map(f => [f.youthId, { id: f.youthId, name: f.youth.name }])).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  const handleConfirmPayment = async (feeId: string) => {
    if (!confirm("Confirmar o pagamento desta mensalidade?")) return
    setIsProcessing(feeId)
    try {
      const res = await fetch(`/api/fees/${feeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' })
      })
      if (res.ok) await loadData()
      else {
        const errorData = await res.json()
        alert(errorData.error || "Erro ao processar o pagamento.")
      }
    } catch (error) {
      alert("Erro de conexão com o servidor.")
    } finally {
      setIsProcessing(null)
    }
  }

  const handleGenerateMonthlyFees = async () => {
    if (!confirm("Deseja gerar as mensalidades? O sistema aplicará os descontos automaticamente.")) return
    setIsGeneratingMonthly(true)
    try {
      const res = await fetch("/api/fees/generate", { method: "POST" })
      const data = await res.json()
      if (res.ok) { alert(data.message); await loadData() }
      else alert(data.error || "Erro ao gerar as mensalidades.")
    } catch (error) { alert("Erro de conexão ao tentar gerar mensalidades.") }
    finally { setIsGeneratingMonthly(false) }
  }

  const handleGenerateCarneExcel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCarneYouth) return alert("Selecione um jovem!")
    
    setIsGenerating(true)
    try {
      const youth = uniqueYouths.find(y => y.id === selectedCarneYouth)
      const youthFees = fees.filter(f => f.youthId === selectedCarneYouth && f.year.toString() === carneYear)

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet(`Carnê ${carneYear}`)

      worksheet.mergeCells('A1:E1')
      const titleCell = worksheet.getCell('A1')
      titleCell.value = `CARNÊ DE MENSALIDADES - GRUPO ESCOTEIRO 107 (${carneYear})`
      titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } }
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
      worksheet.getRow(1).height = 40

      worksheet.mergeCells('A2:E2')
      const subtitleCell = worksheet.getCell('A2')
      subtitleCell.value = `JOVEM: ${youth?.name.toUpperCase()}`
      subtitleCell.font = { size: 12, bold: true }
      subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' }
      worksheet.getRow(2).height = 30

      worksheet.columns = [
        { header: 'MÊS', key: 'month', width: 20 },
        { header: 'VENCIMENTO', key: 'dueDate', width: 20 },
        { header: 'VALOR', key: 'amount', width: 20 },
        { header: 'SITUAÇÃO', key: 'status', width: 20 },
        { header: 'ASSINATURA TESOURARIA', key: 'sign', width: 35 }
      ]

      const headerRow = worksheet.getRow(3)
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      })

      for (let i = 1; i <= 12; i++) {
        const fee = youthFees.find(f => f.month === i)
        let statusLabel = 'SEM REGISTO', statusColor = 'FF64748B', amount = 0, dueDate = '-'

        if (fee) {
          amount = fee.amount
          dueDate = new Date(fee.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
          const computed = getComputedStatus(fee)
          if (computed === 'paid') { statusLabel = 'PAGO'; statusColor = 'FF059669'; }
          else if (computed === 'overdue') { statusLabel = 'ATRASADO'; statusColor = 'FFDC2626'; }
          else { statusLabel = 'PENDENTE'; statusColor = 'FFF59E0B'; }
        }

        const row = worksheet.addRow({ month: months[i - 1].label.toUpperCase(), dueDate, amount: amount > 0 ? amount : '', status: statusLabel, sign: fee?.status === 'paid' ? 'DOCUMENTO PAGO VIRTUALMENTE' : '' })
        row.alignment = { vertical: 'middle', horizontal: 'center' }
        row.getCell('amount').numFmt = '"R$" #,##0.00'
        row.getCell('status').font = { bold: true, color: { argb: statusColor } }
        row.getCell('sign').font = { italic: true, size: 9, color: { argb: 'FF94A3B8' } }
        row.height = 35
        row.eachCell((cell) => cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } })
      }

      const buffer = await workbook.xlsx.writeBuffer()
      const safeName = youth?.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      saveAs(new Blob([buffer]), `Carne_${safeName}_${carneYear}.xlsx`)
      setIsCarneModalOpen(false)
    } finally {
      setIsGenerating(false)
    }
  }

  const dashboardFees = fees.filter(fee => {
    const matchesSearch = fee.youth?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMonth = monthFilter === "ALL" ? true : fee.month.toString() === monthFilter
    const matchesYear = yearFilter === "ALL" ? true : fee.year.toString() === yearFilter
    return matchesSearch && matchesMonth && matchesYear
  })

  const totalRecebido = dashboardFees.filter(f => getComputedStatus(f) === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0)
  const totalPendente = dashboardFees.filter(f => getComputedStatus(f) === 'pending').reduce((acc, curr) => acc + Number(curr.amount), 0)
  const totalAtrasado = dashboardFees.filter(f => getComputedStatus(f) === 'overdue').reduce((acc, curr) => acc + Number(curr.amount), 0)

  const filteredFees = dashboardFees.filter(fee => {
    return statusFilter === "ALL" ? true : getComputedStatus(fee) === statusFilter
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 min-h-screen">
      
      <div className="bg-[#1a1f2e] p-8 rounded-[32px] border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 text-center xl:text-left w-full xl:w-auto">
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Mensalidades</h1>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1 flex items-center justify-center xl:justify-start gap-2">
            <FileText size={14} className="text-emerald-500" /> Gestão Financeira de Sócios
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 w-full xl:w-auto relative z-10 items-center justify-end">
          <div className="relative group w-full lg:w-64 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" placeholder="Buscar por Jovem..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0f172a] border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-emerald-500/50 w-full font-medium"
            />
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto">
            <button onClick={handleGenerateMonthlyFees} disabled={isGeneratingMonthly} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap disabled:opacity-50">
              {isGeneratingMonthly ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />} Gerar Faturas
            </button>
            <button onClick={() => setIsCarneModalOpen(true)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-emerald-600/20 whitespace-nowrap">
              <BookOpen size={16} /> Excel Anual
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1f2e] border border-slate-800 p-5 rounded-[24px] flex items-center gap-4 shadow-lg"><div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><CheckCircle size={20} /></div><div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recebido</p><p className="text-2xl font-black text-white">R$ {totalRecebido.toFixed(2)}</p></div></div>
        <div className="bg-[#1a1f2e] border border-slate-800 p-5 rounded-[24px] flex items-center gap-4 shadow-lg"><div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center"><Clock size={20} /></div><div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">A Receber</p><p className="text-2xl font-black text-white">R$ {totalPendente.toFixed(2)}</p></div></div>
        <div className="bg-[#1a1f2e] border border-slate-800 p-5 rounded-[24px] flex items-center gap-4 shadow-lg"><div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center"><AlertCircle size={20} /></div><div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Em Atraso</p><p className="text-2xl font-black text-white">R$ {totalAtrasado.toFixed(2)}</p></div></div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-[#0f172a] p-3 rounded-2xl border border-slate-800 shadow-inner items-center">
        <div className="flex items-center gap-2 pl-2 pr-4 border-r border-slate-800 text-slate-500"><Filter size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Filtros</span></div>
        <div className="flex flex-wrap gap-3 flex-1 w-full">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#1a1f2e] border border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-300 outline-none focus:border-emerald-500/50 flex-1 md:flex-none">
            <option value="ALL">Status: Todos</option><option value="paid">✅ Pagos</option><option value="pending">⏳ Pendentes</option><option value="overdue">🚨 Atrasados</option>
          </select>
          <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="bg-[#1a1f2e] border border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-300 outline-none focus:border-emerald-500/50 flex-1 md:flex-none">
            <option value="ALL">Mês: Todos</option>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="bg-[#1a1f2e] border border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-300 outline-none focus:border-emerald-500/50 flex-1 md:flex-none">
            <option value="ALL">Ano: Todos</option><option value="2025">2025</option><option value="2026">2026</option>
          </select>
        </div>
      </div>

      <div className="bg-[#1a1f2e] border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
        ) : filteredFees.length === 0 ? (
          <div className="text-center py-20 border-dashed border-2 border-slate-800/50 m-8 rounded-[24px]">
            <FileText className="mx-auto text-slate-600 mb-4" size={48} />
            <p className="text-slate-500 font-black uppercase tracking-[0.2em]">Nenhum registo encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50 max-h-[600px] overflow-y-auto hide-scrollbar">
            <AnimatePresence>
              {filteredFees.map((fee) => {
                const computedStatus = getComputedStatus(fee)
                const isPaid = computedStatus === 'paid'
                const isOverdue = computedStatus === 'overdue'
                
                const statusColor = isPaid ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : isOverdue ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                const statusLabel = isPaid ? 'PAGO' : isOverdue ? 'ATRASADO' : 'PENDENTE'

                return (
                  <motion.div key={fee.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#0f172a]/50 transition-colors">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${statusColor}`}>
                        {isPaid ? <CheckCircle size={20} /> : isOverdue ? <AlertCircle size={20} /> : <Clock size={20} />}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-100 uppercase tracking-tight">{fee.youth?.name || "Jovem Removido"}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700">Ref: {fee.month.toString().padStart(2, '0')}/{fee.year}</span>
                          <span className="text-[9px] font-bold text-slate-500">Venc: {new Date(fee.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full md:w-auto gap-4 pl-16 md:pl-0">
                      <div className="text-left md:text-right pr-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${statusColor}`}>{statusLabel}</span>
                        <p className="text-xl font-black italic tracking-tighter text-slate-200 mt-1">R$ {Number(fee.amount).toFixed(2)}</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        {!isPaid && (
                          <button 
                            onClick={() => setCarneVirtualFee(fee)}
                            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/30 px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
                          >
                            <QrCode size={16} /> Enviar
                          </button>
                        )}
                        {!isPaid && (
                          <button 
                            onClick={() => handleConfirmPayment(fee.id)} disabled={isProcessing === fee.id}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 whitespace-nowrap"
                          >
                            {isProcessing === fee.id ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Baixa</>}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {carneVirtualFee && (
          <CarneVirtual
            youthName={carneVirtualFee.youth?.name}
            branch={carneVirtualFee.youth?.branch}
            amount={carneVirtualFee.amount}
            dueDate={new Date(carneVirtualFee.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
            guardianName={carneVirtualFee.youth?.guardians?.[0]?.name || "Responsável não registado"}
            phone={carneVirtualFee.youth?.guardians?.[0]?.phone}
            onClose={() => setCarneVirtualFee(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCarneModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-[#1a1f2e] border border-slate-800 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent" />
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Gerar Excel</h2>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Planilha Anual p/ Impressão</p>
                </div>
                <button onClick={() => setIsCarneModalOpen(false)} className="text-slate-500 hover:text-red-500 transition-colors p-2 bg-[#0f172a] border border-slate-800 rounded-xl"><X size={20} /></button>
              </div>

              <form onSubmit={handleGenerateCarneExcel} className="space-y-5 relative z-10">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Selecionar Jovem</label>
                  <select required value={selectedCarneYouth} onChange={e => setSelectedCarneYouth(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-slate-200 focus:border-emerald-500/50 outline-none uppercase text-xs font-bold transition-all">
                    <option value="">Selecione...</option>
                    {uniqueYouths.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Ano de Referência</label>
                  <select required value={carneYear} onChange={e => setCarneYear(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-slate-200 focus:border-emerald-500/50 outline-none uppercase text-xs font-bold transition-all">
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>

                <button type="submit" disabled={isGenerating} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs p-4 rounded-2xl transition-all disabled:opacity-50 mt-4 shadow-lg flex justify-center items-center gap-2">
                  {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <><Download size={18} /> Baixar Carnê Excel</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
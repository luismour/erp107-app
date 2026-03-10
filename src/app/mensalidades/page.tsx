"use client"

import { useEffect, useState } from "react"
import { Loader2, CheckCircle, Printer, Trash2, Calendar, Search, Filter, CreditCard, FileSpreadsheet } from "lucide-react"
import Image from "next/image"
import CarneVirtual from "@/components/CarneVirtual"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"

export default function MensalidadesPage() {
  const [fees, setFees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [printingFee, setPrintingFee] = useState<any | null>(null)

  const branches = [
    { id: "Lobinho", img: "/Logo_ramo_lobinho_principal.png" },
    { id: "Escoteiro", img: "/Logo_ramo_escoteiro_principal.png" },
    { id: "Sênior", img: "/Logo_ramo_senior_principal.png" },
    { id: "Pioneiro", img: "/Logo_ramo_pioneiro_principal.png" },
  ]

  async function loadFees() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/fees")
      const data = await res.json()
      setFees(data || [])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadFees() }, [])

  async function handleDeleteFee(id: string) {
    if (!confirm("Excluir esta mensalidade permanentemente?")) return
    const res = await fetch(`/api/fees/${id}`, { method: "DELETE" })
    if (res.ok) setFees(prev => prev.filter(f => f.id !== id))
  }

  async function handleMarkAsPaid(id: string) {
    const res = await fetch(`/api/fees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid" })
    })
    if (res.ok) {
      setFees(prev => prev.map(f => f.id === id ? { ...f, status: "paid" } : f))
    }
  }

  const filteredFees = fees.filter(fee => {
    const matchesBranch = selectedBranch ? fee.youth?.branch === selectedBranch : true
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      fee.youth?.name.toLowerCase().includes(searchLower) || 
      fee.youth?.guardians?.some((g: any) => g.name.toLowerCase().includes(searchLower))
    
    return matchesBranch && matchesSearch
  })

  // ==========================================
  // EXPORTAÇÃO: RELATÓRIO CONSOLIDADO (4 ABAS)
  // ==========================================
  const handleExportConsolidado = async () => {
    setIsExporting(true)
    try {
      const workbook = new ExcelJS.Workbook()

      const styleHeader = (row: ExcelJS.Row, color: string) => {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }
          cell.font = { color: { argb: color }, bold: true, size: 12 }
          cell.alignment = { vertical: 'middle', horizontal: 'center' }
        })
        row.height = 30
      }

      // ---------------------------------------------------------
      // ABA 1: INADIMPLENTES
      // ---------------------------------------------------------
      const wsInadimplentes = workbook.addWorksheet('Cobranças Pendentes')
      wsInadimplentes.columns = [
        { header: 'JOVEM', key: 'youth', width: 35 },
        { header: 'RAMO', key: 'branch', width: 15 },
        { header: 'RESPONSÁVEL', key: 'guardian', width: 35 },
        { header: 'TELEFONE', key: 'phone', width: 20 },
        { header: 'VENCIMENTO', key: 'dueDate', width: 18 },
        { header: 'VALOR PENDENTE', key: 'amount', width: 22 }
      ]
      styleHeader(wsInadimplentes.getRow(1), 'FFFFFFFF')

      const pendingFees = filteredFees.filter(f => f.status === "pending")
      if (pendingFees.length === 0) {
        wsInadimplentes.addRow({ youth: "Tudo em dia! Nenhuma pendência encontrada." })
      } else {
        pendingFees.forEach(fee => {
          const guardian = fee.youth?.guardians?.[0] || {}
          let phone = guardian.phone || "Sem Telefone"
          if (phone.length === 11) phone = `(${phone.substring(0,2)}) ${phone.substring(2,7)}-${phone.substring(7,11)}`

          const row = wsInadimplentes.addRow({
            youth: fee.youth?.name || "Desconhecido",
            branch: fee.youth?.branch || "-",
            guardian: guardian.name || "Sem Responsável",
            phone: phone,
            dueDate: new Date(fee.dueDate).toLocaleDateString('pt-BR'),
            amount: fee.amount
          })
          row.alignment = { vertical: 'middle' }
          row.getCell('branch').alignment = { horizontal: 'center' }
          row.getCell('dueDate').alignment = { horizontal: 'center' }
          row.getCell('amount').numFmt = '"R$" #,##0.00'
          row.getCell('amount').font = { color: { argb: 'FFDC2626' }, bold: true }
        })
      }

      // ---------------------------------------------------------
      // ABA 2: RECEITAS
      // ---------------------------------------------------------
      const wsReceitas = workbook.addWorksheet('Fechamento de Receitas')
      wsReceitas.columns = [
        { header: 'MÊS REF.', key: 'ref', width: 15 },
        { header: 'JOVEM', key: 'youth', width: 35 },
        { header: 'RAMO', key: 'branch', width: 15 },
        { header: 'DATA VENC.', key: 'dueDate', width: 18 },
        { header: 'VALOR RECEBIDO', key: 'amount', width: 22 }
      ]
      styleHeader(wsReceitas.getRow(1), 'FF10B981')

      const paidFees = filteredFees.filter(f => f.status === "paid")
      let totalArrecadado = 0

      if (paidFees.length === 0) {
        wsReceitas.addRow({ youth: "Nenhuma receita encontrada para estes filtros." })
      } else {
        paidFees.forEach(fee => {
          totalArrecadado += fee.amount
          const row = wsReceitas.addRow({
            ref: `${String(fee.month).padStart(2, '0')}/${fee.year}`,
            youth: fee.youth?.name || "Desconhecido",
            branch: fee.youth?.branch || "-",
            dueDate: new Date(fee.dueDate).toLocaleDateString('pt-BR'),
            amount: fee.amount
          })
          row.alignment = { vertical: 'middle' }
          row.getCell('ref').alignment = { horizontal: 'center' }
          row.getCell('branch').alignment = { horizontal: 'center' }
          row.getCell('dueDate').alignment = { horizontal: 'center' }
          row.getCell('amount').numFmt = '"R$" #,##0.00'
          row.getCell('amount').font = { color: { argb: 'FF059669' } }
        })

        const totalRowRec = wsReceitas.addRow({ dueDate: 'TOTAL ARRECADADO:', amount: totalArrecadado })
        totalRowRec.height = 25
        totalRowRec.getCell('dueDate').font = { bold: true, size: 12 }
        totalRowRec.getCell('dueDate').alignment = { horizontal: 'right', vertical: 'middle' }
        totalRowRec.getCell('amount').numFmt = '"R$" #,##0.00'
        totalRowRec.getCell('amount').font = { color: { argb: 'FF059669' }, bold: true, size: 14 }
      }

      // BUSCA DOS DADOS DO CAIXA INDIVIDUAL
      const resYouths = await fetch("/api/youth")
      const youths = await resYouths.json()
      const filteredYouths = selectedBranch ? youths.filter((y: any) => y.branch === selectedBranch) : youths

      // ---------------------------------------------------------
      // ABA 3: SALDOS DO CAIXA (RESUMO)
      // ---------------------------------------------------------
      const wsCaixa = workbook.addWorksheet('Saldos do Caixa')
      wsCaixa.columns = [
        { header: 'JOVEM', key: 'youth', width: 35 },
        { header: 'RAMO', key: 'branch', width: 15 },
        { header: 'QTD MOVIMENTAÇÕES', key: 'transactions', width: 25 },
        { header: 'SALDO DISPONÍVEL', key: 'balance', width: 25 }
      ]
      styleHeader(wsCaixa.getRow(1), 'FF3B82F6') // Azul

      let totalCaixa = 0

      filteredYouths.forEach((youth: any) => {
        const funds = youth.funds || []
        const balance = funds.reduce((acc: number, curr: any) => curr.type === 'credit' ? acc + curr.amount : acc - curr.amount, 0)
        totalCaixa += balance

        const row = wsCaixa.addRow({
          youth: youth.name,
          branch: youth.branch,
          transactions: `${funds.length} registros`,
          balance: balance
        })
        row.alignment = { vertical: 'middle' }
        row.getCell('branch').alignment = { horizontal: 'center' }
        row.getCell('transactions').alignment = { horizontal: 'center' }
        row.getCell('balance').numFmt = '"R$" #,##0.00'
        row.getCell('balance').font = { color: { argb: balance > 0 ? 'FF059669' : 'FF64748B' }, bold: balance > 0 }
      })

      const totalRowCaixa = wsCaixa.addRow({ transactions: 'SALDO GERAL RETIDO:', balance: totalCaixa })
      totalRowCaixa.height = 25
      totalRowCaixa.getCell('transactions').font = { bold: true, size: 12 }
      totalRowCaixa.getCell('transactions').alignment = { horizontal: 'right', vertical: 'middle' }
      totalRowCaixa.getCell('balance').numFmt = '"R$" #,##0.00'
      totalRowCaixa.getCell('balance').font = { color: { argb: 'FF3B82F6' }, bold: true, size: 14 }
      totalRowCaixa.getCell('balance').alignment = { vertical: 'middle' }

      // ---------------------------------------------------------
      // ABA 4: EXTRATO DETALHADO (LINHA DO TEMPO)
      // ---------------------------------------------------------
      const wsExtrato = workbook.addWorksheet('Extrato Detalhado')
      wsExtrato.columns = [
        { header: 'DATA', key: 'date', width: 15 },
        { header: 'JOVEM', key: 'youth', width: 35 },
        { header: 'RAMO', key: 'branch', width: 15 },
        { header: 'TIPO', key: 'type', width: 18 },
        { header: 'MOTIVO / DESCRIÇÃO', key: 'description', width: 45 },
        { header: 'VALOR', key: 'amount', width: 20 }
      ]
      styleHeader(wsExtrato.getRow(1), 'FFA855F7') // Roxo (Purple)

      // Junta todas as movimentações de todos os jovens filtrados
      let todasMovimentacoes: any[] = []
      filteredYouths.forEach((youth: any) => {
        if (youth.funds) {
          youth.funds.forEach((fund: any) => {
            todasMovimentacoes.push({
              ...fund,
              youthName: youth.name,
              branch: youth.branch
            })
          })
        }
      })

      // Ordena da mais recente para a mais antiga (ordem cronológica reversa)
      todasMovimentacoes.sort((a, b) => new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime())

      if (todasMovimentacoes.length === 0) {
        wsExtrato.addRow({ youth: "Nenhuma movimentação registrada no caixa individual." })
      } else {
        todasMovimentacoes.forEach(mov => {
          const isCredit = mov.type === 'credit'
          
          const row = wsExtrato.addRow({
            date: new Date(mov.createdAt || new Date()).toLocaleDateString('pt-BR'),
            youth: mov.youthName,
            branch: mov.branch,
            type: isCredit ? 'ENTRADA' : 'SAÍDA / USO',
            description: mov.description || '-',
            amount: isCredit ? mov.amount : -mov.amount // Mostra negativo se for saída
          })

          row.alignment = { vertical: 'middle' }
          row.getCell('date').alignment = { horizontal: 'center' }
          row.getCell('branch').alignment = { horizontal: 'center' }
          row.getCell('type').alignment = { horizontal: 'center' }
          
          // Cores para Entrada (Verde) e Saída (Vermelho)
          row.getCell('type').font = { color: { argb: isCredit ? 'FF059669' : 'FFDC2626' }, bold: true }
          row.getCell('amount').numFmt = '"R$" #,##0.00'
          row.getCell('amount').font = { color: { argb: isCredit ? 'FF059669' : 'FFDC2626' }, bold: true }
        })
      }

      // ---------------------------------------------------------
      // GERAÇÃO DO ARQUIVO FINAL
      // ---------------------------------------------------------
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const today = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
      saveAs(blob, `Relatorio_Consolidado_107_${selectedBranch || 'Geral'}_${today}.xlsx`)

    } catch (error) {
      console.error("Erro ao exportar:", error)
      alert("Ocorreu um erro ao gerar a planilha.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 min-h-screen">
      
      {/* HEADER CARD */}
      <div className="bg-[#1a1f2e] p-8 rounded-[32px] border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center xl:text-left">
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Mensalidades</h1>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1 flex items-center justify-center xl:justify-start gap-2">
            <Calendar size={14} className="text-emerald-500" /> Controle de Arrecadação
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto relative z-10 justify-center">
          <div className="relative group w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Buscar jovem ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0f172a] border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 w-full sm:w-64 transition-all font-medium"
            />
          </div>
          
          {/* BOTÃO ÚNICO DE RELATÓRIO CONSOLIDADO */}
          <button 
            onClick={handleExportConsolidado}
            disabled={isExporting}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Baixar Planilha Completa (Pendentes, Receitas, Saldos e Extrato)"
          >
            {isExporting ? (
              <><Loader2 size={16} className="animate-spin" /> Gerando Planilha...</>
            ) : (
              <><FileSpreadsheet size={16} /> Relatório Geral (Excel)</>
            )}
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
            <div className="relative w-8 h-8 opacity-70">
              <Image src={b.img} alt={b.id} fill className="object-contain" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{b.id}</span>
          </button>
        ))}
      </div>

      {/* TABELA DE MENSALIDADES */}
      <div className="bg-[#1a1f2e] rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0f172a]/50 text-slate-500 uppercase text-[10px] font-black tracking-[0.2em] border-b border-slate-800">
              <tr>
                <th className="px-10 py-6">Jovem / Ramo</th>
                <th className="px-10 py-6">Vencimento</th>
                <th className="px-10 py-6 text-center">Estado</th>
                <th className="px-10 py-6 text-right">Ações / Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={32} /></td></tr>
              ) : filteredFees.length === 0 ? (
                <tr><td colSpan={4} className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest">Nenhuma mensalidade encontrada</td></tr>
              ) : filteredFees.map((fee) => (
                <tr key={fee.id} className="group hover:bg-[#1e293b]/50 transition-all">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#0f172a] border border-slate-800 flex items-center justify-center text-slate-600 group-hover:text-emerald-500 transition-all">
                        <CreditCard size={22} />
                      </div>
                      <div>
                        <p className="font-black text-slate-100 text-base uppercase tracking-tight">{fee.youth?.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 italic">{fee.youth?.branch}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-slate-400 font-bold italic">
                    {new Date(fee.dueDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
                      fee.status === 'paid' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {fee.status === 'paid' ? 'Liquidado' : 'Aberto'}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => setPrintingFee(fee)} 
                          className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                          title="Ver Carnê"
                        >
                          <Printer size={18} />
                        </button>
                        
                        {fee.status !== 'paid' && (
                          <button 
                            onClick={() => handleMarkAsPaid(fee.id)} 
                            className="p-2.5 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                            title="Confirmar Pagamento"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteFee(fee.id)}
                          className="p-2.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <p className="font-black text-slate-100 text-lg italic ml-4 min-w-[100px]">
                        R$ {fee.amount.toFixed(2)}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {printingFee && (
        <CarneVirtual 
          fee={printingFee} 
          youth={printingFee.youth} 
          onClose={() => setPrintingFee(null)} 
        />
      )}
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LayoutDashboard, Wallet, TrendingDown, AlertTriangle, Users, Activity, ArrowRight, Loader2, PiggyBank, FileSpreadsheet, BarChart2, PieChart as PieChartIcon } from "lucide-react"
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function DashboardPage() {
  const router = useRouter()
  const [youths, setYouths] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  async function loadData() {
    setIsLoading(true)
    try {
      const [youthRes, expRes, invRes] = await Promise.all([
        fetch("/api/youth").catch(() => ({ json: () => [] })),
        fetch("/api/expenses").catch(() => ({ json: () => [] })),
        fetch("/api/inventory").catch(() => ({ json: () => [] }))
      ])
      
      const youthData = await youthRes.json()
      const expData = await expRes.json()
      const invData = await invRes.json()
      
      setYouths(Array.isArray(youthData) ? youthData : [])
      setExpenses(Array.isArray(expData) ? expData : [])
      setInventory(Array.isArray(invData) ? invData : [])
    } catch (error) {
      console.error("Erro ao carregar dashboard", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // =======================================================
  // LÓGICA DO RELATÓRIO EXCEL (MANTIDA INTACTA)
  // =======================================================
  const handleExportGeneralReport = async () => {
    setIsExporting(true)
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'GE 107 Padre Roma';

      const formatHeaderAndBorders = (ws: ExcelJS.Worksheet) => {
        const headerRow = ws.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;
        ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columns.length } };

        ws.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          if (rowNumber > 1) {
            row.eachCell({ includeEmpty: true }, (cell) => {
              cell.border = {
                top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
              };
            });
          }
        });
      };

      const wsEfetivo = workbook.addWorksheet("Efetivo");
      wsEfetivo.columns = [{ header: 'Nome do Jovem', key: 'name', width: 35 }, { header: 'Idade', key: 'age', width: 10 }, { header: 'Ramo', key: 'branch', width: 15 }, { header: 'Data de Entrada', key: 'date', width: 18 }];
      youths.forEach(y => { const row = wsEfetivo.addRow({ name: y.name, age: y.age, branch: y.branch, date: new Date(y.createdAt).toLocaleDateString('pt-BR') }); row.getCell('age').alignment = { horizontal: 'center' }; row.getCell('branch').alignment = { horizontal: 'center' }; row.getCell('date').alignment = { horizontal: 'center' }; });
      formatHeaderAndBorders(wsEfetivo);

      const wsContatos = workbook.addWorksheet("Contatos");
      wsContatos.columns = [{ header: 'Nome do Responsável', key: 'guardianName', width: 35 }, { header: 'Telefone', key: 'phone', width: 20 }, { header: 'Jovem', key: 'youthName', width: 35 }, { header: 'Ramo', key: 'branch', width: 15 }];
      youths.forEach(y => { if (y.guardians) { y.guardians.forEach((g: any) => { const row = wsContatos.addRow({ guardianName: g.name, phone: g.phone, youthName: y.name, branch: y.branch }); row.getCell('phone').alignment = { horizontal: 'center' }; row.getCell('branch').alignment = { horizontal: 'center' }; }); } });
      formatHeaderAndBorders(wsContatos);

      const wsCaixa = workbook.addWorksheet("Caixa Individual");
      wsCaixa.columns = [{ header: 'Jovem', key: 'name', width: 35 }, { header: 'Ramo', key: 'branch', width: 15 }, { header: 'Saldo Disponível', key: 'saldo', width: 20 }];
      youths.forEach(y => { const saldo = y.funds?.reduce((acc: number, curr: any) => acc + (curr.type === 'credit' ? curr.amount : -curr.amount), 0) || 0; const row = wsCaixa.addRow({ name: y.name, branch: y.branch, saldo: saldo }); row.getCell('branch').alignment = { horizontal: 'center' }; row.getCell('saldo').numFmt = '"R$" #,##0.00'; row.getCell('saldo').font = { bold: true, color: { argb: saldo >= 0 ? 'FF10B981' : 'FFEF4444' } }; });
      formatHeaderAndBorders(wsCaixa);

      const wsMensalidades = workbook.addWorksheet("Mensalidades");
      wsMensalidades.columns = [{ header: 'Jovem', key: 'name', width: 35 }, { header: 'Ramo', key: 'branch', width: 15 }, { header: 'Vencimento', key: 'dueDate', width: 15 }, { header: 'Valor Pago/Devido', key: 'amount', width: 22 }, { header: 'Status', key: 'status', width: 18 }];
      let taxas: any[] = [];
      youths.forEach(y => { if (y.fees) { y.fees.forEach((f: any) => taxas.push({ ...f, youthName: y.name, branch: y.branch })); } });
      taxas.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      taxas.forEach(fee => {
        const statusLabel = fee.status.toUpperCase() === "PAGO" || fee.status.toUpperCase() === "PAID" ? "PAGO" : (fee.status.toUpperCase() === "LATE" ? "ATRASADO" : "ABERTO");
        const row = wsMensalidades.addRow({ name: fee.youthName, branch: fee.branch, dueDate: new Date(fee.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }), amount: Number(fee.amount), status: statusLabel });
        row.getCell('branch').alignment = { horizontal: 'center' }; row.getCell('dueDate').alignment = { horizontal: 'center' }; row.getCell('amount').numFmt = '"R$" #,##0.00';
        const statusCell = row.getCell('status'); statusCell.alignment = { horizontal: 'center' }; statusCell.font = { bold: true };
        if (statusLabel === 'PAGO') statusCell.font = { color: { argb: 'FF10B981' }, bold: true }; else if (statusLabel === 'ATRASADO') statusCell.font = { color: { argb: 'FFEF4444' }, bold: true }; else statusCell.font = { color: { argb: 'FFF59E0B' }, bold: true };
      });
      formatHeaderAndBorders(wsMensalidades);

      const wsDespesas = workbook.addWorksheet("Despesas");
      wsDespesas.columns = [{ header: 'Data', key: 'date', width: 15 }, { header: 'Descrição', key: 'desc', width: 40 }, { header: 'Categoria', key: 'cat', width: 20 }, { header: 'Valor Gasto', key: 'amount', width: 18 }];
      expenses.forEach(e => {
        const row = wsDespesas.addRow({ date: new Date(e.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }), desc: e.description, cat: e.category, amount: Number(e.amount) });
        row.getCell('date').alignment = { horizontal: 'center' }; row.getCell('cat').alignment = { horizontal: 'center' }; row.getCell('amount').numFmt = '"-R$" #,##0.00'; row.getCell('amount').font = { color: { argb: 'FFEF4444' }, bold: true }; 
      });
      formatHeaderAndBorders(wsDespesas);

      const wsAlmoxarifado = workbook.addWorksheet("Almoxarifado");
      wsAlmoxarifado.columns = [{ header: 'Material', key: 'name', width: 35 }, { header: 'Categoria', key: 'cat', width: 20 }, { header: 'Estado', key: 'cond', width: 15 }, { header: 'Físico Total', key: 'total', width: 15 }, { header: 'Emprestado', key: 'borrowed', width: 15 }, { header: 'Disponível', key: 'avail', width: 15 }, { header: 'Localização', key: 'loc', width: 25 }];
      inventory.forEach(i => {
        const row = wsAlmoxarifado.addRow({ name: i.name, cat: i.category, cond: i.condition, total: i.quantity, borrowed: i.borrowed || 0, avail: i.quantity - (i.borrowed || 0), loc: i.location || "Sede" });
        row.getCell('cat').alignment = { horizontal: 'center' }; row.getCell('cond').alignment = { horizontal: 'center' }; row.getCell('total').alignment = { horizontal: 'center' }; row.getCell('borrowed').alignment = { horizontal: 'center' }; row.getCell('avail').alignment = { horizontal: 'center' };
        if (i.condition === 'NOVO') row.getCell('cond').font = { color: { argb: 'FF10B981' }, bold: true }; else if (i.condition === 'MANUTENCAO') row.getCell('cond').font = { color: { argb: 'FFEF4444' }, bold: true };
      });
      formatHeaderAndBorders(wsAlmoxarifado);

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      saveAs(blob, `Relatorio_Geral_GE107_${dataAtual}.xlsx`);

    } catch (error) {
      console.error(error)
      alert("Erro de conexão ao tentar exportar o relatório geral.")
    } finally {
      setIsExporting(false)
    }
  }

  // =======================================================
  // CÁLCULOS DOS CARTÕES DE RESUMO
  // =======================================================
  const totalYouths = youths.length
  const branchCounts = {
    Lobinho: youths.filter(y => y.branch === "Lobinho").length,
    Escoteiro: youths.filter(y => y.branch === "Escoteiro").length,
    Sênior: youths.filter(y => y.branch === "Sênior" || y.branch === "Senior").length,
    Pioneiro: youths.filter(y => y.branch === "Pioneiro").length,
  }

  const totalExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)

  const caixaIndividualTotal = youths.reduce((acc, youth) => {
    const youthTotal = youth.funds?.reduce((sum: number, fund: any) => sum + (fund.type === 'credit' ? Number(fund.amount) : -Number(fund.amount)), 0) || 0
    return acc + youthTotal
  }, 0)

  let inadimplentes = 0
  let valorInadimplente = 0
  let receitasPagas = 0
  
  // Para a métrica de saúde do Mês Atual
  let expectedThisMonth = 0
  let paidThisMonth = 0

  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()
  today.setUTCHours(0, 0, 0, 0)

  youths.forEach(youth => {
    const fees = youth.fees || []
    fees.forEach((f: any) => {
      const status = String(f.status || '').toUpperCase().trim()
      const amount = Number(f.amount) || 0
      
      if (status === 'PAGO' || status === 'PAID') {
        receitasPagas += amount
      } else {
        const dueDate = new Date(f.dueDate)
        dueDate.setUTCHours(0, 0, 0, 0)
        if (dueDate < today) {
          inadimplentes++
          valorInadimplente += amount
        }
      }

      // Métricas do Mês Atual
      if (f.month === currentMonth && f.year === currentYear) {
        expectedThisMonth += amount
        if (status === 'PAGO' || status === 'PAID') paidThisMonth += amount
      }
    })
  })

  const saldoAtual = receitasPagas - totalExpenses
  const currentMonthHealth = expectedThisMonth > 0 ? Math.round((paidThisMonth / expectedThisMonth) * 100) : 0

  // =======================================================
  // CÁLCULOS PARA OS GRÁFICOS (RECHARTS)
  // =======================================================
  
  // 1. Gráfico de Barras: Entradas vs Saídas (Últimos 6 meses)
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return { month: d.getMonth() + 1, year: d.getFullYear(), label: d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '') }
  }).reverse()

  const chartDataFinanceiro = last6Months.map(m => {
    let entradas = 0
    youths.forEach(y => {
      y.fees?.forEach((f: any) => {
        if (f.month === m.month && f.year === m.year && (f.status === 'paid' || f.status === 'PAGO')) entradas += Number(f.amount)
      })
    })

    let saidas = 0
    expenses.forEach(e => {
      const d = new Date(e.date)
      if (d.getMonth() + 1 === m.month && d.getFullYear() === m.year) saidas += Number(e.amount)
    })

    return { name: m.label, Entradas: entradas, Saídas: saidas }
  })

  // 2. Gráfico Circular: Distribuição por Ramos
  const chartDataRamos = [
    { name: "Lobinho", value: branchCounts.Lobinho, color: "#f59e0b" }, // amber
    { name: "Escoteiro", value: branchCounts.Escoteiro, color: "#10b981" }, // emerald
    { name: "Sênior", value: branchCounts.Sênior, color: "#f43f5e" }, // rose
    { name: "Pioneiro", value: branchCounts.Pioneiro, color: "#3b82f6" }, // blue
  ].filter(r => r.value > 0)

  // Tooltip Customizado para o Gráfico de Barras
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xl transition-colors">
          <p className="font-black text-slate-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-xs font-bold uppercase tracking-widest flex justify-between gap-4">
              <span>{entry.name}:</span>
              <span>R$ {entry.value.toFixed(2)}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Tooltip Customizado para o Gráfico Circular
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl transition-colors flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
          <p className="font-bold text-slate-900 dark:text-white uppercase text-xs">{payload[0].name}: {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  // =======================================================
  // RENDERIZAÇÃO DA PÁGINA
  // =======================================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a] transition-colors">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 min-h-screen transition-colors duration-300">
      
      {/* CABEÇALHO DO DASHBOARD */}
      <div className="bg-white dark:bg-[#1a1f2e] p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase transition-colors">Painel de Controle</h1>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1 flex items-center gap-2">
            <LayoutDashboard size={14} className="text-emerald-600 dark:text-emerald-500" /> Visão Geral do Grupo 107º
          </p>
        </div>

        <div className="relative z-10 w-full md:w-auto">
          <button 
            onClick={handleExportGeneralReport} disabled={isExporting}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[11px] tracking-widest transition-all shadow-xl shadow-emerald-500/20 w-full md:w-auto disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />} 
            {isExporting ? "A Gerar Excel..." : "Baixar Relatório Geral"}
          </button>
        </div>
      </div>

      {/* CARTÕES DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`bg-white dark:bg-[#1a1f2e] border ${saldoAtual < 0 ? 'border-red-200 dark:border-red-500/30' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500/30'} p-6 rounded-[28px] relative overflow-hidden group transition-all shadow-sm dark:shadow-xl`}>
          <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl transition-all ${saldoAtual < 0 ? 'bg-red-500/10 dark:bg-red-500/5 group-hover:bg-red-500/20 dark:group-hover:bg-red-500/10' : 'bg-emerald-500/10 dark:bg-emerald-500/5 group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-500/10'}`} />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${saldoAtual < 0 ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500'}`}><Wallet size={24} /></div>
          </div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 relative z-10">Saldo Atual (Grupo)</h3>
          <p className={`text-3xl font-black italic tracking-tighter relative z-10 ${saldoAtual < 0 ? 'text-red-600 dark:text-red-500' : 'text-emerald-600 dark:text-emerald-500'}`}>R$ {saldoAtual.toFixed(2)}</p>
          <div className="mt-2 flex gap-2 text-[9px] font-bold uppercase tracking-widest relative z-10"><span className="text-emerald-600/70 dark:text-emerald-500/70">Entradas: R$ {receitasPagas.toFixed(2)}</span></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 p-6 rounded-[28px] relative overflow-hidden group hover:border-blue-300 dark:hover:border-blue-500/30 transition-all shadow-sm dark:shadow-xl">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/10 transition-all" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500"><PiggyBank size={24} /></div>
          </div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 relative z-10">Caixas Individuais</h3>
          <p className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter relative z-10 transition-colors">R$ {caixaIndividualTotal.toFixed(2)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 p-6 rounded-[28px] relative overflow-hidden group hover:border-red-300 dark:hover:border-red-500/30 transition-all shadow-sm dark:shadow-[0_0_15px_rgba(239,68,68,0.05)]">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 dark:bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/20 dark:group-hover:bg-red-500/10 transition-all" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-500"><AlertTriangle size={24} /></div>
            <span className="text-[10px] font-black text-red-600 dark:text-red-500 uppercase tracking-widest bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-full border border-red-200 dark:border-red-500/20">{inadimplentes} Atrasos</span>
          </div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 relative z-10">A Receber (Atrasado)</h3>
          <p className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter relative z-10 transition-colors">R$ {valorInadimplente.toFixed(2)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 p-6 rounded-[28px] relative overflow-hidden group hover:border-orange-300 dark:hover:border-orange-500/30 transition-all shadow-sm dark:shadow-xl">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/20 dark:group-hover:bg-orange-500/10 transition-all" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-500"><TrendingDown size={24} /></div>
            <span className="text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-500/10 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-500/20">{expenses.length} Reg.</span>
          </div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 relative z-10">Despesas do Grupo</h3>
          <p className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter relative z-10 transition-colors">R$ {totalExpenses.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* =======================================================
          ZONA DOS GRÁFICOS (NOVOS!)
          ======================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* GRÁFICO 1: FLUXO DE CAIXA (BARRAS) */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="xl:col-span-2 bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] shadow-xl dark:shadow-2xl transition-colors">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase transition-colors">Fluxo Financeiro</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Últimos 6 Meses (Mensalidades vs Despesas)</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors">
              <BarChart2 size={20} />
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataFinanceiro} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} tickFormatter={(value) => `R$${value}`} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#334155', opacity: 0.1 }} />
                <Bar dataKey="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Saídas" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* GRÁFICO 2: DISTRIBUIÇÃO POR RAMO (DONUT) */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="xl:col-span-1 bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] shadow-xl dark:shadow-2xl flex flex-col transition-colors">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase transition-colors">Efetivo do Grupo</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{totalYouths} Membros Ativos</p>
            </div>
            <PieChartIcon size={20} className="text-slate-400 dark:text-slate-500" />
          </div>

          <div className="flex-1 flex flex-col justify-center relative min-h-[250px]">
            {totalYouths > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie data={chartDataRamos} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {chartDataRamos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Sem dados</div>
            )}
            
            {/* Legenda Customizada */}
            <div className="mt-4 grid grid-cols-2 gap-y-3">
              {chartDataRamos.map((ramo) => (
                <div key={ramo.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ramo.color }} />
                  <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                    {ramo.name} <span className="text-slate-400 dark:text-slate-600">({ramo.value})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* =======================================================
          ZONA INFERIOR: SAÚDE MENSAL & RECENTES
          ======================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARD: SAÚDE DAS MENSALIDADES DO MÊS */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }} className="bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] shadow-xl dark:shadow-2xl transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase transition-colors">Taxa de Recebimento</h2>
            <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-500 text-[9px] font-black uppercase tracking-widest">
              Mês Atual
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-slate-100 dark:border-slate-800 transition-colors">
              {/* Círculo de progresso simulado via CSS conic-gradient (Tailwind arbitrário) */}
              <div className="absolute inset-0 rounded-full border-8 border-emerald-500 transition-all duration-1000" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${currentMonthHealth}%, 0 ${currentMonthHealth}%)`, opacity: 0.8 }} />
              <div className="text-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter">{currentMonthHealth}%</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 text-center">
              R$ {paidThisMonth.toFixed(2)} recebidos de R$ {expectedThisMonth.toFixed(2)} previstos para este mês.
            </p>
          </div>
        </motion.div>

        {/* ATIVIDADE RECENTE (DESPESAS) */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} className="lg:col-span-2 bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] shadow-xl dark:shadow-2xl flex flex-col transition-colors">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase transition-colors">Despesas Recentes</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Últimas Saídas Financeiras</p>
            </div>
            <Activity size={20} className="text-slate-400 dark:text-slate-500" />
          </div>

          <div className="flex-1 space-y-4">
            {expenses.slice(0, 3).map((exp, i) => (
              <div key={i} className="flex items-center gap-4 bg-slate-50 dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-500 shrink-0">
                  <TrendingDown size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate transition-colors">{exp.description || "Despesa"}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{new Date(exp.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <p className="text-sm font-black text-orange-600 dark:text-orange-500 italic">
                  -R$ {Number(exp.amount).toFixed(2)}
                </p>
              </div>
            ))}

            {expenses.length === 0 && (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
                Nenhuma movimentação
              </div>
            )}
          </div>

          <button 
            onClick={() => router.push('/despesas')}
            className="mt-6 w-full py-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            Ver Histórico Completo <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>

    </div>
  )
}
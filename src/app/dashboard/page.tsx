"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  LayoutDashboard, Wallet, TrendingDown, AlertTriangle, 
  Users, Activity, ArrowRight, Loader2, PiggyBank, FileSpreadsheet 
} from "lucide-react"
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

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
      wsEfetivo.columns = [
        { header: 'Nome do Jovem', key: 'name', width: 35 },
        { header: 'Idade', key: 'age', width: 10 },
        { header: 'Ramo', key: 'branch', width: 15 },
        { header: 'Data de Entrada', key: 'date', width: 18 }
      ];
      youths.forEach(y => {
        const row = wsEfetivo.addRow({
          name: y.name,
          age: y.age,
          branch: y.branch,
          date: new Date(y.createdAt).toLocaleDateString('pt-BR')
        });
        row.getCell('age').alignment = { horizontal: 'center' };
        row.getCell('branch').alignment = { horizontal: 'center' };
        row.getCell('date').alignment = { horizontal: 'center' };
      });
      formatHeaderAndBorders(wsEfetivo);

      const wsContatos = workbook.addWorksheet("Contatos");
      wsContatos.columns = [
        { header: 'Nome do Responsável', key: 'guardianName', width: 35 },
        { header: 'Telefone', key: 'phone', width: 20 },
        { header: 'Jovem', key: 'youthName', width: 35 },
        { header: 'Ramo', key: 'branch', width: 15 }
      ];
      youths.forEach(y => {
        if (y.guardians) {
          y.guardians.forEach((g: any) => {
            const row = wsContatos.addRow({
              guardianName: g.name,
              phone: g.phone,
              youthName: y.name,
              branch: y.branch
            });
            row.getCell('phone').alignment = { horizontal: 'center' };
            row.getCell('branch').alignment = { horizontal: 'center' };
          });
        }
      });
      formatHeaderAndBorders(wsContatos);

      const wsCaixa = workbook.addWorksheet("Caixa Individual");
      wsCaixa.columns = [
        { header: 'Jovem', key: 'name', width: 35 },
        { header: 'Ramo', key: 'branch', width: 15 },
        { header: 'Saldo Disponível', key: 'saldo', width: 20 }
      ];
      youths.forEach(y => {
        const saldo = y.funds?.reduce((acc: number, curr: any) => acc + (curr.type === 'credit' ? curr.amount : -curr.amount), 0) || 0;
        const row = wsCaixa.addRow({ name: y.name, branch: y.branch, saldo: saldo });
        row.getCell('branch').alignment = { horizontal: 'center' };
        row.getCell('saldo').numFmt = '"R$" #,##0.00';
        row.getCell('saldo').font = { bold: true, color: { argb: saldo >= 0 ? 'FF10B981' : 'FFEF4444' } };
      });
      formatHeaderAndBorders(wsCaixa);

      const wsMensalidades = workbook.addWorksheet("Mensalidades");
      wsMensalidades.columns = [
        { header: 'Jovem', key: 'name', width: 35 },
        { header: 'Ramo', key: 'branch', width: 15 },
        { header: 'Vencimento', key: 'dueDate', width: 15 },
        { header: 'Valor Pago/Devido', key: 'amount', width: 22 },
        { header: 'Status', key: 'status', width: 18 }
      ];
      
      let taxas: any[] = [];
      youths.forEach(y => {
        if (y.fees) {
          y.fees.forEach((f: any) => taxas.push({ ...f, youthName: y.name, branch: y.branch }));
        }
      });
      taxas.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

      taxas.forEach(fee => {
        const statusLabel = fee.status.toUpperCase() === "PAGO" || fee.status.toUpperCase() === "PAID" 
          ? "PAGO" : (fee.status.toUpperCase() === "LATE" ? "ATRASADO" : "ABERTO");
          
        const row = wsMensalidades.addRow({
          name: fee.youthName,
          branch: fee.branch,
          dueDate: new Date(fee.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
          amount: Number(fee.amount),
          status: statusLabel
        });

        row.getCell('branch').alignment = { horizontal: 'center' };
        row.getCell('dueDate').alignment = { horizontal: 'center' };
        row.getCell('amount').numFmt = '"R$" #,##0.00';
        
        const statusCell = row.getCell('status');
        statusCell.alignment = { horizontal: 'center' };
        statusCell.font = { bold: true };
        if (statusLabel === 'PAGO') statusCell.font = { color: { argb: 'FF10B981' }, bold: true };
        else if (statusLabel === 'ATRASADO') statusCell.font = { color: { argb: 'FFEF4444' }, bold: true };
        else statusCell.font = { color: { argb: 'FFF59E0B' }, bold: true };
      });
      formatHeaderAndBorders(wsMensalidades);

      const wsDespesas = workbook.addWorksheet("Despesas");
      wsDespesas.columns = [
        { header: 'Data', key: 'date', width: 15 },
        { header: 'Descrição', key: 'desc', width: 40 },
        { header: 'Categoria', key: 'cat', width: 20 },
        { header: 'Valor Gasto', key: 'amount', width: 18 }
      ];
      expenses.forEach(e => {
        const row = wsDespesas.addRow({
          date: new Date(e.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
          desc: e.description,
          cat: e.category,
          amount: Number(e.amount)
        });
        row.getCell('date').alignment = { horizontal: 'center' };
        row.getCell('cat').alignment = { horizontal: 'center' };
        row.getCell('amount').numFmt = '"-R$" #,##0.00';
        row.getCell('amount').font = { color: { argb: 'FFEF4444' }, bold: true }; 
      });
      formatHeaderAndBorders(wsDespesas);

      const wsAlmoxarifado = workbook.addWorksheet("Almoxarifado");
      wsAlmoxarifado.columns = [
        { header: 'Material', key: 'name', width: 35 },
        { header: 'Categoria', key: 'cat', width: 20 },
        { header: 'Estado', key: 'cond', width: 15 },
        { header: 'Físico Total', key: 'total', width: 15 },
        { header: 'Emprestado', key: 'borrowed', width: 15 },
        { header: 'Disponível', key: 'avail', width: 15 },
        { header: 'Localização', key: 'loc', width: 25 }
      ];
      inventory.forEach(i => {
        const row = wsAlmoxarifado.addRow({
          name: i.name,
          cat: i.category,
          cond: i.condition,
          total: i.quantity,
          borrowed: i.borrowed || 0,
          avail: i.quantity - (i.borrowed || 0),
          loc: i.location || "Sede"
        });
        row.getCell('cat').alignment = { horizontal: 'center' };
        row.getCell('cond').alignment = { horizontal: 'center' };
        row.getCell('total').alignment = { horizontal: 'center' };
        row.getCell('borrowed').alignment = { horizontal: 'center' };
        row.getCell('avail').alignment = { horizontal: 'center' };
        
        if (i.condition === 'NOVO') row.getCell('cond').font = { color: { argb: 'FF10B981' }, bold: true };
        else if (i.condition === 'MANUTENCAO') row.getCell('cond').font = { color: { argb: 'FFEF4444' }, bold: true };
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
  const totalYouths = youths.length
  const branchCounts = {
    Lobinho: youths.filter(y => y.branch === "Lobinho").length,
    Escoteiro: youths.filter(y => y.branch === "Escoteiro").length,
    Sênior: youths.filter(y => y.branch === "Sênior" || y.branch === "Senior").length,
    Pioneiro: youths.filter(y => y.branch === "Pioneiro").length,
  }

  const totalExpenses = expenses.reduce((acc, curr) => {
    const amount = typeof curr.amount === 'string' ? parseFloat(curr.amount) : Number(curr.amount) || 0
    return acc + amount
  }, 0)

  const caixaIndividualTotal = youths.reduce((acc, youth) => {
    const youthTotal = youth.funds?.reduce((sum: number, fund: any) => {
      const amount = typeof fund.amount === 'string' ? parseFloat(fund.amount) : Number(fund.amount) || 0
      return sum + (fund.type === 'credit' ? amount : -amount) 
    }, 0) || 0
    return acc + youthTotal
  }, 0)

  let inadimplentes = 0
  let valorInadimplente = 0
  let receitasPagas = 0

  youths.forEach(youth => {
    const fees = youth.fees || []
    fees.forEach((f: any) => {
      const status = String(f.status || '').toUpperCase().trim()
      const amount = typeof f.amount === 'string' ? parseFloat(f.amount) : Number(f.amount) || 0
      if (status === 'PAGO' || status === 'PAID') {
        receitasPagas += amount
      } else if (status === 'ABERTO' || status === 'PENDING' || status === 'LATE') {
        inadimplentes++
        valorInadimplente += amount
      }
    })
  })

  const saldoAtual = receitasPagas - totalExpenses

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 min-h-screen">
      <div className="bg-[#1a1f2e] p-8 rounded-[32px] border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Painel de Controle</h1>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1 flex items-center gap-2">
            <LayoutDashboard size={14} className="text-emerald-500" /> Visão Geral do Grupo 107º
          </p>
        </div>

        <div className="relative z-10 w-full md:w-auto">
          <button 
            onClick={handleExportGeneralReport}
            disabled={isExporting}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[11px] tracking-widest transition-all shadow-xl shadow-emerald-500/20 w-full md:w-auto disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />} 
            {isExporting ? "A Gerar Excel..." : "Baixar Relatório Geral"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`bg-[#1a1f2e] border border-slate-800 p-6 rounded-[28px] relative overflow-hidden group transition-all ${saldoAtual < 0 ? 'hover:border-red-500/30' : 'hover:border-emerald-500/30'}`}>
          <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl transition-all ${saldoAtual < 0 ? 'bg-red-500/5 group-hover:bg-red-500/10' : 'bg-emerald-500/5 group-hover:bg-emerald-500/10'}`} />
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${saldoAtual < 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}><Wallet size={24} /></div>
          </div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Saldo Atual (Grupo)</h3>
          <p className={`text-3xl font-black italic tracking-tighter ${saldoAtual < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
            R$ {saldoAtual.toFixed(2)}
          </p>
          <div className="mt-2 flex gap-2 text-[9px] font-bold uppercase tracking-widest">
            <span className="text-emerald-500/70">Entradas: R$ {receitasPagas.toFixed(2)}</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#1a1f2e] border border-slate-800 p-6 rounded-[28px] relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500"><PiggyBank size={24} /></div>
          </div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Caixas Individuais</h3>
          <p className="text-3xl font-black text-white italic tracking-tighter">R$ {caixaIndividualTotal.toFixed(2)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#1a1f2e] border border-slate-800 p-6 rounded-[28px] relative overflow-hidden group hover:border-red-500/30 transition-all shadow-[0_0_15px_rgba(239,68,68,0.05)]">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500"><AlertTriangle size={24} /></div>
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">{inadimplentes} Pendências</span>
          </div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">A Receber</h3>
          <p className="text-3xl font-black text-white italic tracking-tighter">R$ {valorInadimplente.toFixed(2)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#1a1f2e] border border-slate-800 p-6 rounded-[28px] relative overflow-hidden group hover:border-orange-500/30 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500"><TrendingDown size={24} /></div>
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">{expenses.length} Reg.</span>
          </div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Despesas do Grupo</h3>
          <p className="text-3xl font-black text-white italic tracking-tighter">R$ {totalExpenses.toFixed(2)}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="lg:col-span-2 bg-[#1a1f2e] border border-slate-800 p-8 rounded-[32px] shadow-2xl relative">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Efetivo do Grupo</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Total: {totalYouths} Membros Ativos</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-400 border border-slate-700">
              <Users size={20} />
            </div>
          </div>

          <div className="space-y-6">
            {[
              { nome: "Lobinho", qtd: branchCounts.Lobinho, color: "bg-amber-500", text: "text-amber-500" },
              { nome: "Escoteiro", qtd: branchCounts.Escoteiro, color: "bg-emerald-500", text: "text-emerald-500" },
              { nome: "Sênior", qtd: branchCounts.Sênior, color: "bg-rose-500", text: "text-rose-500" },
              { nome: "Pioneiro", qtd: branchCounts.Pioneiro, color: "bg-blue-500", text: "text-blue-500" }
            ].map((ramo) => {
              const porcentagem = totalYouths > 0 ? Math.round((ramo.qtd / totalYouths) * 100) : 0
              return (
                <div key={ramo.nome} className="relative">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                    <span className={ramo.text}>{ramo.nome}</span>
                    <span className="text-slate-400">{ramo.qtd} ({porcentagem}%)</span>
                  </div>
                  <div className="w-full h-3 bg-[#0f172a] rounded-full overflow-hidden border border-slate-800">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${porcentagem}%` }} 
                      transition={{ duration: 1, delay: 0.6 }}
                      className={`h-full ${ramo.color} rounded-full`} 
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="bg-[#1a1f2e] border border-slate-800 p-8 rounded-[32px] shadow-2xl flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Recentes</h2>
            <Activity size={20} className="text-slate-500" />
          </div>

          <div className="flex-1 space-y-4">
            {expenses.slice(0, 4).map((exp, i) => (
              <div key={i} className="flex items-center gap-4 bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <TrendingDown size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-200 truncate">{exp.description || "Despesa"}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Saída</p>
                </div>
                <p className="text-sm font-black text-orange-500 italic">
                  -R$ {Number(exp.amount).toFixed(2)}
                </p>
              </div>
            ))}

            {expenses.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                Nenhuma movimentação
              </div>
            )}
          </div>

          <button 
            onClick={() => router.push('/despesas')}
            className="mt-6 w-full py-4 rounded-2xl border border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800/50 hover:text-white transition-all"
          >
            Ver Relatório Completo <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
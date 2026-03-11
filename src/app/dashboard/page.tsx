"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  LayoutDashboard, Wallet, TrendingDown, AlertTriangle, 
  Users, Activity, ArrowRight, Loader2, PiggyBank 
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [youths, setYouths] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadData() {
    setIsLoading(true)
    try {
      const [youthRes, expRes] = await Promise.all([
        fetch("/api/youth").catch(() => ({ json: () => [] })),
        fetch("/api/expenses").catch(() => ({ json: () => [] }))
      ])
      
      const youthData = await youthRes.json()
      const expData = await expRes.json()
      
      setYouths(Array.isArray(youthData) ? youthData : [])
      setExpenses(Array.isArray(expData) ? expData : [])
    } catch (error) {
      console.error("Erro ao carregar dashboard", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // Efetivo do Grupo
  const totalYouths = youths.length
  const branchCounts = {
    Lobinho: youths.filter(y => y.branch === "Lobinho").length,
    Escoteiro: youths.filter(y => y.branch === "Escoteiro").length,
    Sênior: youths.filter(y => y.branch === "Sênior" || y.branch === "Senior").length,
    Pioneiro: youths.filter(y => y.branch === "Pioneiro").length,
  }

  // Despesas Reais
  const totalExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)

  // Caixas Individuais Reais (Soma todos os fundos de todos os jovens)
  const caixaIndividualTotal = youths.reduce((acc, youth) => {
    const youthTotal = youth.funds?.reduce((sum: number, fund: any) => sum + (Number(fund.amount) || 0), 0) || 0
    return acc + youthTotal
  }, 0)

  // Mensalidades e Inadimplência Reais
  let inadimplentes = 0
  let valorInadimplente = 0
  let receitasPagas = 0

  youths.forEach(youth => {
    const pendingFees = youth.fees?.filter((f: any) => f.status === 'ABERTO') || []
    const paidFees = youth.fees?.filter((f: any) => f.status === 'PAGO') || []

    if (pendingFees.length > 0) inadimplentes++
    
    valorInadimplente += pendingFees.reduce((sum: number, f: any) => sum + (Number(f.amount) || 0), 0)
    receitasPagas += paidFees.reduce((sum: number, f: any) => sum + (Number(f.amount) || 0), 0)
  })

  // Saldo Atual Real (Mensalidades Pagas - Despesas do Grupo)
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`bg-[#1a1f2e] border border-slate-800 p-6 rounded-[28px] relative overflow-hidden group transition-all ${saldoAtual < 0 ? 'hover:border-red-500/30' : 'hover:border-emerald-500/30'}`}>
          <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl transition-all ${saldoAtual < 0 ? 'bg-red-500/5 group-hover:bg-red-500/10' : 'bg-emerald-500/5 group-hover:bg-emerald-500/10'}`} />
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${saldoAtual < 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}><Wallet size={24} /></div>
          </div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Saldo Atual (Grupo)</h3>
          <p className={`text-3xl font-black italic tracking-tighter ${saldoAtual < 0 ? 'text-red-500' : 'text-white'}`}>
            R$ {saldoAtual.toFixed(2)}
          </p>
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
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">{inadimplentes} Jovens</span>
          </div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Inadimplência</h3>
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
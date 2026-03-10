"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  Loader2, 
  ArrowUpRight,
  ChevronRight,
  Home,
  Target
} from "lucide-react"

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0f172a]">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
    </div>
  )

  // Formatação profissional de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  const totalGeral = (data?.arrecadado || 0) + (data?.pendente || 0)
  const taxaLiquidacao = totalGeral > 0 ? ((data?.arrecadado / totalGeral) * 100).toFixed(1) : 0

  const cards = [
    { 
      title: "Total Arrecadado", 
      value: formatCurrency(data?.arrecadado), 
      icon: <DollarSign />, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10",
      border: "group-hover:border-emerald-500/30"
    },
    { 
      title: "Total Pendente", 
      value: formatCurrency(data?.pendente), 
      icon: <Clock />, 
      color: "text-amber-500", 
      bg: "bg-amber-500/10",
      border: "group-hover:border-amber-500/30"
    },
    { 
      title: "Efetivo Ativo", 
      value: `${data?.totalMembros || 0} Jovens`, 
      icon: <Users />, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10",
      border: "group-hover:border-blue-500/30"
    },
  ]

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
      
      {/* HEADER COM BOTÃO HOME */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-[#1a1f2e] p-8 rounded-[32px] border border-slate-800 shadow-2xl">
        <div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            Financeiro <span className="text-emerald-500">Overview</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">
            Controle de Receitas • 107º Grupo Escoteiro Padre Roma
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* BOTÃO PARA A ROTA INICIAL */}
          <Link 
            href="/" 
            className="px-6 py-3 bg-[#0f172a] hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-500 rounded-2xl transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg"
          >
            <Home size={16} /> Página Inicial
          </Link>

          <div className="hidden md:flex px-4 py-3 bg-[#0f172a] border border-slate-800 rounded-2xl items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sistema Online</span>
          </div>
        </div>
      </header>

      {/* CARDS PRINCIPAIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={card.title}
            className={`bg-[#1a1f2e] border border-slate-800 p-8 rounded-[32px] shadow-2xl relative overflow-hidden group transition-all duration-300 ${card.border}`}
          >
            <div className={`p-4 rounded-2xl w-fit ${card.bg} ${card.color} mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
              {card.icon}
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{card.title}</p>
            <h2 className="text-3xl font-black text-white mt-2 italic tracking-tight">{card.value}</h2>
            <ArrowUpRight className="absolute top-8 right-8 text-slate-800 group-hover:text-white transition-colors" size={20} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PROGRESSO POR RAMO (Ocupa 2 colunas em telas grandes) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#1a1f2e] border border-slate-800 p-8 rounded-[32px] shadow-2xl lg:col-span-2"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-white font-black uppercase text-xs tracking-widest flex items-center gap-2">
              <Target size={16} className="text-emerald-500" /> Receita por Ramo
            </h3>
            <ChevronRight className="text-slate-600" size={16} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {data?.statsRamos.map((ramo: any) => {
              const porcentagem = totalGeral > 0 ? ((ramo.value / totalGeral) * 100) : 0;
              return (
                <div key={ramo.name} className="space-y-3 p-4 bg-[#0f172a] rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{ramo.name}</span>
                    <span className="text-sm font-black text-emerald-400 italic">{formatCurrency(ramo.value)}</span>
                  </div>
                  <div className="h-2 bg-[#1a1f2e] rounded-full overflow-hidden border border-slate-800">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${porcentagem}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* ANALISE DE LIQUIDAÇÃO */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-[#1a1f2e] to-[#0f172a] border border-slate-800 p-8 rounded-[32px] shadow-2xl flex flex-col justify-center items-center text-center relative overflow-hidden"
        >
          {/* Efeito de brilho de fundo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
          
          <div className="w-24 h-24 rounded-full bg-[#0f172a] flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <TrendingUp size={40} className="text-emerald-500" />
          </div>
          
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Saúde do Caixa</h3>
          
          <div className="mt-6 p-4 bg-[#0f172a] border border-slate-800 rounded-2xl w-full">
            <p className="text-4xl font-black text-emerald-500">{taxaLiquidacao}%</p>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Taxa de Liquidação</p>
          </div>
          
          <p className="text-slate-400 text-xs mt-6 leading-relaxed">
            Mantenha a taxa de liquidação acima de 80% para garantir a sustentabilidade das atividades do grupo.
          </p>
        </motion.div>
        
      </div>
    </div>
  )
}
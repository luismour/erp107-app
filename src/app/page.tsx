"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Users, 
  CreditCard, 
  UserCheck, 
  PieChart,
  ArrowRight,
  ShieldCheck
} from "lucide-react"

export default function HomePage() {
  const modules = [
    {
      title: "Visão Geral",
      description: "Acesse o painel financeiro, gráficos de arrecadação e saúde do caixa.",
      icon: <PieChart size={32} />,
      href: "/dashboard",
      color: "text-emerald-600 dark:text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "hover:border-emerald-400 dark:hover:border-emerald-500/50"
    },
    {
      title: "Mensalidades",
      description: "Gerencie pagamentos, gere carnês virtuais e controle inadimplências.",
      icon: <CreditCard size={32} />,
      href: "/mensalidades",
      color: "text-amber-600 dark:text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "hover:border-amber-400 dark:hover:border-amber-500/50"
    },
    {
      title: "Membros Juvenis",
      description: "Cadastro de jovens, divisão por ramos e histórico de escoteiros ativos.",
      icon: <Users size={32} />,
      href: "/jovens",
      color: "text-blue-600 dark:text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "hover:border-blue-400 dark:hover:border-blue-500/50"
    },
    {
      title: "Responsáveis",
      description: "Contatos de emergência, responsáveis financeiros e comunicação.",
      icon: <UserCheck size={32} />,
      href: "/responsaveis",
      color: "text-purple-600 dark:text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      border: "hover:border-purple-400 dark:hover:border-purple-500/50"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 transition-colors duration-300">
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm dark:shadow-xl transition-colors">
          <ShieldCheck size={14} /> Acesso Administrativo
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter mb-4 transition-colors">
          Portal do <span className="text-emerald-600 dark:text-emerald-500 transition-colors">107º/PE GEPR</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium leading-relaxed transition-colors">
          Bem-vindo ao sistema de gestão integrada do Grupo Escoteiro Padre Roma. 
          Seleccione abaixo o módulo que deseja aceder para continuar.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        {modules.map((mod, idx) => (
          <Link href={mod.href} key={mod.title}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`group bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] shadow-sm dark:shadow-2xl transition-all duration-300 ${mod.border} hover:shadow-emerald-500/5 cursor-pointer flex flex-col h-full relative overflow-hidden`}
            >
              <div className="absolute -inset-24 bg-gradient-to-r from-transparent via-slate-100/50 dark:via-slate-700/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000 ease-in-out pointer-events-none" />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className={`p-4 rounded-2xl ${mod.bg} ${mod.color} transition-colors`}>
                  {mod.icon}
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-white group-hover:bg-slate-800 dark:group-hover:bg-slate-800 transition-colors">
                  <ArrowRight size={18} />
                </div>
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight mb-2 relative z-10 transition-colors">
                {mod.title}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed relative z-10 transition-colors">
                {mod.description}
              </p>
            </motion.div>
          </Link>
        ))}
      </div>

    </div>
  )
}
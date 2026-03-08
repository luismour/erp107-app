"use client"

import { useEffect, useState } from "react"
import DashboardCard from "@/components/DashboardCard"
import { Loader2, PlusCircle } from "lucide-react"

interface Fee {
  id: string
  youth_name: string
  month: number
  status: "paid" | "pending" | "late"
  amount: number
}

// Utilitário para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export default function Dashboard() {
  const [fees, setFees] = useState<Fee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [stats, setStats] = useState({ paid: 0, pending: 0, late: 0 })

  async function loadDashboard() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/dashboard")
      const data = await response.json()
      setFees(data.fees || [])
      setStats({
        paid: data.paid || 0,
        pending: data.pending || 0,
        late: data.late || 0,
      })
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function generateFees() {
    const confirm = window.confirm("Deseja gerar as mensalidades deste mês?")
    if (!confirm) return

    setIsGenerating(true)
    try {
      await fetch("/api/generate-fees", { method: "POST" })
      alert("Mensalidades geradas com sucesso!")
      loadDashboard()
    } catch (error) {
      console.error("Erro ao gerar mensalidades:", error)
      alert("Ocorreu um erro ao gerar as mensalidades.")
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Visão geral das mensalidades do grupo escoteiro.
          </p>
        </div>

        <button 
          onClick={generateFees} 
          disabled={isGenerating}
          className="btn-primary shadow-sm"
        >
          {isGenerating ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <PlusCircle size={18} />
          )}
          {isGenerating ? "A gerar..." : "Gerar Mensalidades"}
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard 
          title="Receita Recebida" 
          value={formatCurrency(stats.paid)} 
          className="border-l-4 border-l-emerald-500"
        />
        <DashboardCard 
          title="A Receber (Pendentes)" 
          value={formatCurrency(stats.pending)} 
          className="border-l-4 border-l-amber-500"
        />
        <DashboardCard 
          title="Em Atraso" 
          value={`${stats.late} mensalidades`} 
          className="border-l-4 border-l-red-500"
        />
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="text-lg font-semibold">Mensalidades Recentes</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs uppercase font-semibold" style={{ color: "var(--color-text-muted)" }}>
              <tr>
                <th className="px-6 py-4">Jovem</th>
                <th className="px-6 py-4">Mês Referência</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto mb-2 text-emerald-500" size={24} />
                    <p style={{ color: "var(--color-text-muted)" }}>A carregar dados...</p>
                  </td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center" style={{ color: "var(--color-text-muted)" }}>
                    Nenhuma mensalidade encontrada.
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{fee.youth_name}</td>
                    <td className="px-6 py-4">{fee.month}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        fee.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" :
                        fee.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" :
                        "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                      }`}>
                        {fee.status === "paid" && "Pago"}
                        {fee.status === "pending" && "Pendente"}
                        {fee.status === "late" && "Atrasado"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {formatCurrency(fee.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
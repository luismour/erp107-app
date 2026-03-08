"use client"

import { useEffect, useState } from "react"
import { Loader2, PlusCircle, Calendar } from "lucide-react"

interface Fee {
  id: string
  month: number
  year: number
  amount: number
  status: "paid" | "pending" | "late"
  dueDate: string
  youth?: { name: string }
  youthId?: string
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export default function MensalidadesPage() {
  const [fees, setFees] = useState<Fee[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadFees() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/fees")
      const data = await response.json()
      setFees(data.fees || data || [])
    } catch (error) {
      console.error("Erro ao carregar mensalidades:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFees()
  }, [])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-text)" }}>Mensalidades</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Histórico completo e gestão de todos os pagamentos.
          </p>
        </div>
        <button className="btn-primary shadow-sm">
          <PlusCircle size={18} />
          Nova Mensalidade
        </button>
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>Todas as Mensalidades</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs uppercase font-semibold" style={{ color: "var(--color-text-muted)" }}>
              <tr>
                <th className="px-6 py-4">Jovem</th>
                <th className="px-6 py-4">Referência</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto mb-2 text-emerald-500" size={24} />
                    <p style={{ color: "var(--color-text-muted)" }}>A carregar dados...</p>
                  </td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center" style={{ color: "var(--color-text-muted)" }}>
                    Nenhuma mensalidade encontrada.
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium" style={{ color: "var(--color-text)" }}>
                      {fee.youth?.name || "ID: " + fee.youthId}
                    </td>
                    <td className="px-6 py-4" style={{ color: "var(--color-text-muted)" }}>
                      {String(fee.month).padStart(2, '0')} / {fee.year}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
                        <Calendar size={14} />
                        {new Date(fee.dueDate).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
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
                    <td className="px-6 py-4 text-right font-medium" style={{ color: "var(--color-text)" }}>
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
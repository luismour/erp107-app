"use client"

import { useEffect, useState } from "react"
import DashboardCard from "@/components/DashboardCard"

interface Fee {
  id: string
  youth_name: string
  month: number
  status: string
  amount: number
}

export default function Dashboard() {

  const [fees, setFees] = useState<Fee[]>([])
  const [stats, setStats] = useState({
    paid: 0,
    pending: 0,
    late: 0
  })

  async function loadDashboard() {

    const response = await fetch("/api/dashboard")

    const data = await response.json()

    setFees(data.fees)

    setStats({
      paid: data.paid,
      pending: data.pending,
      late: data.late
    })

  }

  async function generateFees() {

    const confirm = window.confirm(
      "Deseja gerar as mensalidades deste mês?"
    )

    if (!confirm) return

    await fetch("/api/generate-fees", {
      method: "POST"
    })

    alert("Mensalidades geradas!")

    loadDashboard()

  }

  useEffect(() => {
    loadDashboard()
  }, [])

  return (

    <div className="space-y-8">

      {/* Cabeçalho */}

      <div className="flex justify-between items-center">

        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--color-text)" }}
          >
            Dashboard Financeiro
          </h1>

          <p className="text-gray-500">
            Visão geral das mensalidades
          </p>
        </div>

        <button
          onClick={generateFees}
          className="btn-primary"
        >
          Gerar mensalidades
        </button>

      </div>

      {/* Cards */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <DashboardCard
          title="Pagos"
          value={`R$ ${stats.paid}`}
        />

        <DashboardCard
          title="Pendentes"
          value={`R$ ${stats.pending}`}
        />

        <DashboardCard
          title="Atrasados"
          value={`${stats.late}`}
        />

      </div>

      {/* Tabela */}

      <div className="card p-6">

        <h2 className="text-lg font-semibold mb-4">
          Mensalidades recentes
        </h2>

        <table className="w-full text-sm">

          <thead className="border-b text-gray-500">

            <tr>
              <th className="text-left py-3">Jovem</th>
              <th className="text-left">Mês</th>
              <th className="text-left">Status</th>
              <th className="text-left">Valor</th>
            </tr>

          </thead>

          <tbody>

            {fees.map((fee) => (

              <tr
                key={fee.id}
                className="border-b"
              >

                <td className="py-3">
                  {fee.youth_name}
                </td>

                <td>
                  {fee.month}
                </td>

                <td>

                  {fee.status === "paid" && (
                    <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
                      Pago
                    </span>
                  )}

                  {fee.status === "pending" && (
                    <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs">
                      Pendente
                    </span>
                  )}

                  {fee.status === "late" && (
                    <span className="px-2 py-1 rounded bg-red-100 text-red-600 text-xs">
                      Atrasado
                    </span>
                  )}

                </td>

                <td>
                  R$ {fee.amount}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}
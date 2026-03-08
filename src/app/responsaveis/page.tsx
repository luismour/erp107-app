"use client"

import { useEffect, useState } from "react"
import { Loader2, PlusCircle, Phone } from "lucide-react"

interface Guardian {
  id: string
  name: string
  phone: string
  youth?: { name: string } // Se a sua API devolver os dados populados do Prisma
  youthId?: string
}

export default function ResponsaveisPage() {
  const [guardians, setGuardians] = useState<Guardian[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadGuardians() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/guardian")
      const data = await response.json()
      setGuardians(data.guardians || data || [])
    } catch (error) {
      console.error("Erro ao carregar responsáveis:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadGuardians()
  }, [])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-text)" }}>Responsáveis</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Gestão dos encarregados de educação dos jovens.
          </p>
        </div>
        <button className="btn-primary shadow-sm">
          <PlusCircle size={18} />
          Adicionar Responsável
        </button>
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>Lista de Responsáveis</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs uppercase font-semibold" style={{ color: "var(--color-text-muted)" }}>
              <tr>
                <th className="px-6 py-4">Nome do Responsável</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Jovem Associado</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto mb-2 text-emerald-500" size={24} />
                    <p style={{ color: "var(--color-text-muted)" }}>A carregar dados...</p>
                  </td>
                </tr>
              ) : guardians.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center" style={{ color: "var(--color-text-muted)" }}>
                    Nenhum responsável registado.
                  </td>
                </tr>
              ) : (
                guardians.map((guardian) => (
                  <tr key={guardian.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium" style={{ color: "var(--color-text)" }}>{guardian.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
                        <Phone size={14} />
                        {guardian.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4" style={{ color: "var(--color-text)" }}>
                      {guardian.youth?.name || "ID: " + guardian.youthId}
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
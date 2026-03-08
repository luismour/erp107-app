"use client"

import { useEffect, useState } from "react"
import { Loader2, PlusCircle, X } from "lucide-react"

interface Youth {
  id: string
  name: string
  age: number
  branch: string
}

export default function JovensPage() {
  const [youths, setYouths] = useState<Youth[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Estados para o Modal e Formulário
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    branch: "Lobinho", // Valor por defeito
    guardianName: "",
    guardianPhone: ""
  })

  // Carregar os jovens
  async function loadYouths() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/youth")
      const data = await response.json()
      setYouths(data.youths || data || [])
    } catch (error) {
      console.error("Erro ao carregar jovens:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadYouths()
  }, [])

  // Lidar com a submissão do formulário
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/youth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert("Jovem registado com sucesso!")
        setIsModalOpen(false) // Fecha o modal
        setFormData({ name: "", age: "", branch: "Lobinho", guardianName: "", guardianPhone: "" }) // Limpa o formulário
        loadYouths() // Recarrega a tabela
      } else {
        alert("Erro ao registar o jovem.")
      }
    } catch (error) {
      console.error("Erro na submissão:", error)
      alert("Erro na submissão.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cores das Badges por Ramo
  const getBranchBadgeColor = (branch: string) => {
    const b = branch.toLowerCase()
    if (b.includes("lobinho")) return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
    if (b.includes("escoteiro")) return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
    if (b.includes("sênior") || b.includes("senior")) return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400"
    if (b.includes("pioneiro")) return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400"
    return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300"
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-text)" }}>Jovens</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Gestão dos membros juvenis do grupo escoteiro.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary shadow-sm"
        >
          <PlusCircle size={18} />
          Adicionar Jovem
        </button>
      </div>

      {/* Tabela de Jovens */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>Lista de Jovens</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs uppercase font-semibold" style={{ color: "var(--color-text-muted)" }}>
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Idade</th>
                <th className="px-6 py-4">Ramo</th>
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
              ) : youths.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center" style={{ color: "var(--color-text-muted)" }}>
                    Nenhum jovem registado.
                  </td>
                </tr>
              ) : (
                youths.map((youth) => (
                  <tr key={youth.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium" style={{ color: "var(--color-text)" }}>{youth.name}</td>
                    <td className="px-6 py-4" style={{ color: "var(--color-text-muted)" }}>{youth.age} anos</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getBranchBadgeColor(youth.branch)}`}>
                        {youth.branch}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CADASTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="card w-full max-w-lg p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>Registar Novo Jovem</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                style={{ color: "var(--color-text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Secção do Jovem */}
              <div className="space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 border" style={{ borderColor: "var(--color-border)" }}>
                <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-primary)" }}>Dados do Escoteiro</h3>
                
                <div>
                  <label className="block text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2.5 rounded-lg border bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    placeholder="Ex: João Silva"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>Idade</label>
                    <input 
                      type="number" 
                      required
                      min="6"
                      max="21"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="w-full p-2.5 rounded-lg border bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                      placeholder="Ex: 12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>Ramo</label>
                    <select 
                      value={formData.branch}
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                      className="w-full p-2.5 rounded-lg border bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    >
                      <option value="Lobinho">Lobinho (6,5 a 10 anos)</option>
                      <option value="Escoteiro">Escoteiro (11 a 14 anos)</option>
                      <option value="Sênior">Sênior (15 a 17 anos)</option>
                      <option value="Pioneiro">Pioneiro (18 a 21 anos)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Secção do Responsável */}
              <div className="space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 border" style={{ borderColor: "var(--color-border)" }}>
                <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-primary)" }}>Dados do Responsável</h3>
                
                <div>
                  <label className="block text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>Nome do Responsável</label>
                  <input 
                    type="text" 
                    required
                    value={formData.guardianName}
                    onChange={(e) => setFormData({...formData, guardianName: e.target.value})}
                    className="w-full p-2.5 rounded-lg border bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    placeholder="Ex: Maria Silva"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>Contacto Telefónico</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({...formData, guardianPhone: e.target.value})}
                    className="w-full p-2.5 rounded-lg border bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    placeholder="Ex: (81) 90000-0000"
                  />
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium border hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                  {isSubmitting ? "A guardar..." : "Guardar Registo"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
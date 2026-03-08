"use client" // Necessário para usar hooks do Next.js

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, UsersRound, ReceiptText, Tent } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Jovens", href: "/jovens", icon: Users },
    { name: "Responsáveis", href: "/responsaveis", icon: UsersRound },
    { name: "Mensalidades", href: "/mensalidades", icon: ReceiptText },
  ]

  return (
    <aside className="w-64 min-h-screen border-r bg-surface border-[var(--color-border)] p-6 flex flex-col">
      {/* Logótipo / Cabeçalho */}
      <div className="mb-10 flex items-center gap-3">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg text-emerald-600 dark:text-emerald-400">
          <Tent size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight">Grupo 107º</h2>
          <p className="text-xs text-muted-foreground" style={{ color: "var(--color-text-muted)" }}>
            Padre Roma - Finanças
          </p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
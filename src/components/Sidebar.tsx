import Link from "next/link"

export default function Sidebar() {
  return (
    <aside
      className="w-64 min-h-screen p-6 flex flex-col"
      style={{ background: "var(--color-primary)", color: "white" }}
    >

      <div className="mb-10">
        <h2 className="text-xl font-bold">
          Gestão Escoteira
        </h2>
        <p className="text-sm opacity-80">
          Financeiro
        </p>
      </div>

      <nav className="flex flex-col gap-2">

        <Link
          href="/dashboard"
          className="px-3 py-2 rounded hover:bg-green-600 transition"
        >
          Dashboard
        </Link>

        <Link
          href="/jovens"
          className="px-3 py-2 rounded hover:bg-green-600 transition"
        >
          Jovens
        </Link>

        <Link
          href="/responsaveis"
          className="px-3 py-2 rounded hover:bg-green-600 transition"
        >
          Responsáveis
        </Link>

        <Link
          href="/mensalidades"
          className="px-3 py-2 rounded hover:bg-green-600 transition"
        >
          Mensalidades
        </Link>

      </nav>

    </aside>
  )
}
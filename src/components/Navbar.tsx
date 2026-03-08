export default function Navbar() {
  return (
    <header
      className="px-8 py-4 flex justify-between items-center border-b"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)"
      }}
    >

      <h1 style={{ color: "var(--color-text)" }}>
        107º Grupo Escoteiro Padre Roma
      </h1>

      <div className="flex items-center gap-4">

        <span className="text-sm text-gray-500">
          Financeiro
        </span>

        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white"
          style={{ background: "var(--color-primary)" }}
        >
          F
        </div>

      </div>

    </header>
  )
}
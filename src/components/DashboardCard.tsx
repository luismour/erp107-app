interface Props {
  title: string
  value: string
  className?: string 
}

export default function DashboardCard({ title, value, className = "" }: Props) {
  return (
    <div
      className={`rounded-xl shadow-sm border p-5 ${className}`}
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
        {title}
      </p>

      <p
        className="text-3xl font-bold mt-2"
        style={{ color: "var(--color-text)" }}
      >
        {value}
      </p>

    </div>
  )
}
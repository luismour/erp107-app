interface Props {
  title: string
  value: string
}

export default function DashboardCard({ title, value }: Props) {
  return (
    <div
      className="rounded-xl shadow-sm border p-5"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p
        className="text-3xl font-bold mt-2"
        style={{ color: "var(--color-primary)" }}
      >
        {value}
      </p>

    </div>
  )
}
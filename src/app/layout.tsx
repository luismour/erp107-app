import "./globals.css"
import Sidebar from "@/components/Sidebar"
import Navbar from "@/components/Navbar"

export const metadata = {
  title: "Gestão Financeira - 107º Grupo Escoteiro Padre Roma",
  description: "Sistema de gerenciamento de mensalidades escoteiras",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>

        <div className="flex min-h-screen">

          {/* Sidebar */}
          <Sidebar />

          {/* Área principal */}
          <div className="flex flex-col flex-1">

            {/* Navbar */}
            <Navbar />

            {/* Conteúdo */}
            <main className="flex-1 p-8">
              {children}
            </main>

          </div>

        </div>

      </body>
    </html>
  )
}
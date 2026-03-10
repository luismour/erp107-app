import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/Sidebar"
import AutoLogout from "@/components/AutoLogout"
import { Providers } from "@/components/Providers" 
import AuthGuard from "@/components/AuthGuard"      

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gestão Financeira - 107º Padre Roma",
  description: "Sistema de gestão financeira do Grupo Escoteiro",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          <AuthGuard>
            
            <AutoLogout />
            
            <Sidebar>
              {children}
            </Sidebar>

          </AuthGuard>
        </Providers>
      </body>
    </html>
  )
}
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/Sidebar"
import AutoLogout from "@/components/AutoLogout"
import { Providers } from "@/components/Providers" 
import AuthGuard from "@/components/AuthGuard"      
import { ThemeProvider } from "@/components/ThemeProvider"

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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Providers>
            <AuthGuard>
              
              <AutoLogout />
              
              <Sidebar>
                {children}
              </Sidebar>

            </AuthGuard>
          </Providers>
        </ThemeProvider>

      </body>
    </html>
  )
}
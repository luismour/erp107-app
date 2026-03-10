import type { Metadata } from "next";
import { Inter } from "next/font/google"; // ou a fonte que estiver usando
import "./globals.css";
import Sidebar from "@/components/Sidebar"; // O arquivo que acabamos de criar!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "107º Grupo Escoteiro - Financeiro",
  description: "Sistema de Gestão Financeira",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* Envolvemos os 'children' com o nosso novo Sidebar */}
        <Sidebar>
          {children}
        </Sidebar>
      </body>
    </html>
  );
}
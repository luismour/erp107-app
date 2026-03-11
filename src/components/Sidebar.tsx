"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { signOut } from "next-auth/react"
import { 
  Home, 
  PieChart, 
  CreditCard, 
  Users, 
  UserCheck, 
  Menu, 
  X, 
  Bell, 
  Wallet, 
  LogOut,
  TrendingDown,
  Package
} from "lucide-react"

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
  }, [isOpen])

  if (pathname === '/login') {
    return <main className="min-h-screen bg-[#0f172a] w-full">{children}</main>
  }

  const navItems = [
    { name: "Início", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: PieChart },
    { name: "Caixa Individual", href: "/caixa", icon: Wallet },
    { name: "Mensalidades", href: "/mensalidades", icon: CreditCard },
    { name: "Despesas", href: "/despesas", icon: TrendingDown },
    { name: "Jovens", href: "/jovens", icon: Users },
    { name: "Responsáveis", href: "/responsaveis", icon: UserCheck },
    { name: "Almoxarifado", href: "/inventario", icon: Package }, // <-- ADICIONADO AQUI
  ]

  const NavLinks = ({ mobile = false }) => (
    <div className="flex flex-col gap-2 w-full mt-6">
      {navItems.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link href={item.href} key={item.name} onClick={() => mobile && setIsOpen(false)}>
            <div className={`relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group cursor-pointer overflow-hidden ${isActive ? 'text-emerald-500 font-black' : 'text-slate-400 hover:text-slate-200 font-bold'}`}>
              
              {isActive && (
                <motion.div
                  layoutId={mobile ? "activeTabMobile" : "activeTabDesktop"}
                  className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <motion.div 
                className="relative z-10"
                whileHover={{ scale: 1.1, rotate: isActive ? 0 : -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <item.icon size={20} className={isActive ? "text-emerald-500" : "text-slate-500 group-hover:text-emerald-500 transition-colors"} />
              </motion.div>
              
              <span className="relative z-10 text-xs uppercase tracking-widest">{item.name}</span>
            </div>
          </Link>
        )
      })}
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#0f172a] selection:bg-emerald-500/30">
      <aside className="hidden md:flex flex-col w-72 bg-[#1a1f2e] border-r border-slate-800 fixed h-full z-40">
        <div className="p-8 flex items-center gap-4 border-b border-slate-800/50">
          <div className="w-14 h-14 rounded-full bg-white border-2 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center shrink-0">
            <div className="relative w-12 h-12 rounded-full overflow-hidden">
              <Image 
                src="/logo-107.png" 
                alt="Logo 107º Padre Roma" 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div>
            <h1 className="text-white font-black italic tracking-tighter text-xl leading-none">Grupo 107º</h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Padre Roma</p>
          </div>
        </div>
        
        <div className="flex-1 px-4 py-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <p className="px-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Menu Principal</p>
          <NavLinks />
        </div>

        <div className="p-6 border-t border-slate-800/50">
          <div className="flex items-center justify-between bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-slate-400">T</div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-wider">Tesouraria</p>
                <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Online</p>
              </div>
            </div>
            
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })} 
              title="Encerrar Sessão"
              className="p-2.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col md:ml-72 transition-all duration-300">
        <header className="md:hidden flex items-center justify-between p-4 bg-[#1a1f2e] border-b border-slate-800 sticky top-0 z-40">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-white border border-emerald-500/30 flex items-center justify-center shrink-0">
               <div className="relative w-8 h-8 rounded-full overflow-hidden">
                 <Image 
                   src="/logo-107.jpg" 
                   alt="Logo 107º Padre Roma" 
                   fill 
                   className="object-cover"
                 />
               </div>
             </div>
             <h1 className="text-white font-black italic tracking-tighter text-lg">Grupo 107º</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#1a1f2e]"></span>
            </button>
            <button onClick={() => setIsOpen(true)} className="p-2 bg-[#0f172a] border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
              <Menu size={20} />
            </button>
          </div>
        </header>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              />

              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-[#1a1f2e] border-l border-slate-800 shadow-2xl z-50 p-6 flex flex-col md:hidden"
              >
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-800">
                  <div>
                    <h2 className="text-white font-black italic tracking-tighter text-2xl">Menu</h2>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Navegação Rápida</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-3 bg-[#0f172a] rounded-xl text-slate-400 hover:text-red-500 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <NavLinks mobile={true} />
                </div>

                <div className="mt-auto pt-6 border-t border-slate-800">
                  <div className="flex items-center justify-between bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-slate-400">T</div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-wider">Tesouraria</p>
                        <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Online</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => signOut({ callbackUrl: '/login' })} 
                      title="Encerrar Sessão"
                      className="p-2.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 p-2 md:p-6 w-full max-w-[100vw] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
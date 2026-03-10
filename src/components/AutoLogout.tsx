"use client"

import { signOut } from "next-auth/react"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function AutoLogout() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/login') return

    let timeoutId: NodeJS.Timeout

    const resetTimer = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        alert("Sessão expirada por inatividade. Por segurança, faça o login novamente.")
        signOut({ callbackUrl: '/login' })
      }, 900000) 
    }
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart']

    events.forEach(event => window.addEventListener(event, resetTimer))
    resetTimer() 

    return () => {
      clearTimeout(timeoutId)
      events.forEach(event => window.removeEventListener(event, resetTimer))
    }
  }, [pathname])

  return null 
}
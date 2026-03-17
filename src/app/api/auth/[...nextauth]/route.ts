import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) return null

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          console.log(`Tentativa de acesso a conta bloqueada: ${user.email}`);
          throw new Error("Conta bloqueada por excesso de tentativas. Tente novamente em 15 minutos.")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isPasswordValid) {
          const attempts = user.failedAttempts + 1
          let lockTime = null
          
          if (attempts >= 5) {
            lockTime = new Date(Date.now() + 15 * 60 * 1000)
          }
          await prisma.user.update({
            where: { email: user.email },
            data: { failedAttempts: attempts, lockedUntil: lockTime }
          })

          if (lockTime) {
            throw new Error("Errou a senha 5 vezes. A sua conta foi bloqueada por 15 minutos por segurança.")
          }
          
          return null 
        }
        if (user.failedAttempts > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { email: user.email },
            data: { failedAttempts: 0, lockedUntil: null }
          })
        }

        return { id: user.id, name: user.name, email: user.email }
      }
    })
  ],
  pages: {
    signIn: '/login', 
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
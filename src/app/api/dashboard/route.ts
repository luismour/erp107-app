import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export async function GET() {
  try {
    const session = await getServerSession()
    const totalArrecadado = await prisma.fee.aggregate({
      where: { status: "paid" },
      _sum: { amount: true }
    })

    const totalPendente = await prisma.fee.aggregate({
      where: { status: "pending" },
      _sum: { amount: true }
    })

    const contagemJovens = await prisma.youth.count()
    
    const ramos = ["Lobinho", "Escoteiro", "Sênior", "Pioneiro"]
    const statsRamos = await Promise.all(ramos.map(async (ramo) => {
      const valor = await prisma.fee.aggregate({
        where: {
          youth: { branch: ramo }
        },
        _sum: { amount: true }
      })
      return { name: ramo, value: valor._sum.amount || 0 }
    }))

    return NextResponse.json({
      arrecadado: totalArrecadado._sum.amount || 0,
      pendente: totalPendente._sum.amount || 0,
      totalMembros: contagemJovens,
      statsRamos
    })
  } catch (error) {
    console.error("Erro Dashboard API:", error)
    return NextResponse.json({ error: "Erro ao carregar dashboard" }, { status: 500 })
  }
}
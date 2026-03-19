import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export async function POST(request: Request) {
  try {
    // 1. Segurança Máxima
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Acesso Negado." }, { status: 401 })
    }

    const body = await request.json()
    const { youthIds, amount, type, description } = body

    if (!youthIds || !Array.isArray(youthIds) || youthIds.length === 0) {
      return NextResponse.json({ error: "Nenhum jovem selecionado." }, { status: 400 })
    }
    if (!amount || !type || !description) {
      return NextResponse.json({ error: "Preencha o valor, tipo e descrição." }, { status: 400 })
    }

    const fundsData = youthIds.map((id: string) => ({
      youthId: id,
      amount: Number(amount),
      type: String(type), 
      description: String(description)
    }))

    const createdFunds = await prisma.fundTransaction.createMany({
      data: fundsData
    })

    return NextResponse.json({ 
      message: "Lançamento em lote realizado com sucesso", 
      count: createdFunds.count 
    }, { status: 201 })

  } catch (error) {
    console.error("Erro no lançamento em lote:", error)
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 })
  }
}
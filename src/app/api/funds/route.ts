import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const transaction = await prisma.fundTransaction.create({
      data: {
        youthId: body.youthId,
        amount: Number(body.amount),
        description: body.description,
        type: body.type, 
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Erro ao registrar movimentação:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
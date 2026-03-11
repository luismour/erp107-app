import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: "desc" }
    })
    return NextResponse.json(expenses)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar despesas" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { description, amount, date, category } = body

    const expense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        category
      }
    })

    return NextResponse.json(expense)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar despesa" }, { status: 500 })
  }
}
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth" 

export async function GET() {
  try {

    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Acesso Negado. Não autorizado." }, { status: 401 })
    }

    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(expenses)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar despesas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {

    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Acesso Negado. Não autorizado." }, { status: 401 })
    }

    const body = await request.json()
    const { description, amount, date, category } = body

    if (!description || amount === undefined || amount === "") {
      return NextResponse.json({ error: "Descrição e valor são obrigatórios." }, { status: 400 })
    }
    const newExpense = await prisma.expense.create({
      data: {
        description: String(description),
        amount: Number(amount), 
        date: date ? new Date(date) : new Date(),
        category: category ? String(category) : "Outros"
      }
    })

    return NextResponse.json(newExpense, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar despesa:", error)
    return NextResponse.json({ error: "Erro interno ao tentar salvar a despesa." }, { status: 500 })
  }
}
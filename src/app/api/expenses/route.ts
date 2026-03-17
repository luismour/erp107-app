import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { z } from "zod" 
const expenseSchema = z.object({
  description: z.string()
    .min(3, "A descrição deve ter pelo menos 3 carateres.")
    .max(150, "A descrição é demasiado longa (máx 150 carateres).")
    .trim(), 
  
  amount: z.coerce.number()
    .positive("O valor da despesa deve ser maior que zero."),
  
  date: z.coerce.date().optional(),
  
  category: z.string()
    .max(50, "O nome da categoria é muito longo.")
    .trim()
    .optional(),
})

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Acesso Negado." }, { status: 401 })
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
      return NextResponse.json({ error: "Acesso Negado." }, { status: 401 })
    }

    const body = await request.json()

    const validation = expenseSchema.safeParse(body)

    if (!validation.success) {
      console.log("Tentativa de injeção ou erro de validação bloqueada pelo Zod!")
      return NextResponse.json(
        { 
          error: "Dados inválidos.", 
          details: validation.error.flatten().fieldErrors 
        }, 
        { status: 400 }
      )
    }

    const { description, amount, date, category } = validation.data

    const newExpense = await prisma.expense.create({
      data: {
        description,
        amount, 
        date: date ? date : new Date(),
        category: category ? category : "Outros"
      }
    })

    return NextResponse.json(newExpense, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar despesa:", error)
    return NextResponse.json({ error: "Erro interno ao tentar salvar a despesa." }, { status: 500 })
  }
}
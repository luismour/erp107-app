import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export async function GET() {
  try {
    const session = await getServerSession()
    const items = await prisma.inventoryItem.findMany({
      orderBy: { name: 'asc' } 
    })
    
    return NextResponse.json(items)
  } catch (error) {
    console.error("Erro ao buscar inventário:", error)
    return NextResponse.json({ error: "Erro ao buscar materiais do almoxarifado" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    const body = await request.json()
    const { name, description, category, condition, quantity, location } = body

    if (!name || !category) {
      return NextResponse.json({ error: "Nome e Categoria são obrigatórios." }, { status: 400 })
    }

    const newItem = await prisma.inventoryItem.create({
      data: {
        name,
        description,
        category,
        condition: condition || "BOM",
        quantity: Number(quantity) || 1,
        location,
        borrowed: 0, 
      }
    })

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar item no inventário:", error)
    return NextResponse.json({ error: "Erro ao cadastrar material" }, { status: 500 })
  }
}
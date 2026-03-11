import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { name, description, category, condition, quantity, location } = body

    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name,
        description,
        category,
        condition,
        location,
        quantity: Number(quantity)
      }
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error("Erro ao atualizar item:", error)
    return NextResponse.json({ error: "Erro ao atualizar o material" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    await prisma.inventoryItem.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Item excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir item:", error)
    return NextResponse.json({ error: "Erro ao excluir o material" }, { status: 500 })
  }
}
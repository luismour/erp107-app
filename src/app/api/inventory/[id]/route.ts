import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Acesso Negado." }, { status: 401 })
    }

    const params = await props.params;
    const itemId = params.id;

    const body = await request.json()
    // AGORA RECEBE O CAMPO OWNER (Responsável)
    const { name, description, category, condition, quantity, location, borrowed, owner } = body

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        name,
        description,
        category,
        condition,
        quantity: quantity !== undefined ? Number(quantity) : undefined,
        location,
        borrowed: borrowed !== undefined ? Number(borrowed) : undefined,
        owner: owner !== undefined ? String(owner) : null, 
      }
    })

    return NextResponse.json(updatedItem, { status: 200 })
  } catch (error) {
    console.error("Erro ao atualizar material:", error)
    return NextResponse.json({ error: "Erro interno ao atualizar material" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: "Acesso Negado." }, { status: 401 })

    const params = await props.params;
    const itemId = params.id;

    await prisma.inventoryItem.delete({ where: { id: itemId } })
    return NextResponse.json({ message: "Material excluído com sucesso." }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno ao excluir material" }, { status: 500 })
  }
}
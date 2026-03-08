import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const youth = await prisma.youth.findUnique({
      where: {
        id: params.id
      },
      include: {
        guardians: true,
        fees: true
      }
    })

    if (!youth) {
      return NextResponse.json({ error: "Jovem não encontrado" }, { status: 404 })
    }

    return NextResponse.json(youth)
  } catch (error) {
    console.error("Erro ao procurar jovem:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const youth = await prisma.youth.update({
      where: {
        id: params.id
      },
      data: {
        name: body.name,
        age: body.age ? Number(body.age) : undefined, 
        branch: body.branch 
      }
    })

    return NextResponse.json(youth)
  } catch (error) {
    console.error("Erro ao atualizar jovem:", error);
    return NextResponse.json({ error: "Erro ao atualizar jovem" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.youth.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: "Jovem removido" })
  } catch (error) {
    console.error("Erro ao remover jovem:", error);
    return NextResponse.json({ error: "Erro ao remover jovem" }, { status: 500 })
  }
}
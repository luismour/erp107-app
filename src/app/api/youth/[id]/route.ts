import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"; 


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    const { id } = await params;
    const youth = await prisma.youth.findUnique({
      where: { id },
      include: {
        guardians: true, 
        fees: {
          orderBy: { dueDate: 'desc' } 
        }
      }
    })

    if (!youth) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    return NextResponse.json(youth);
  } catch (error) {
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    const { id } = await params;
    const body = await request.json()

    const updateData: any = {}
    if (body.name) updateData.name = body.name
    if (body.age) updateData.age = Number(body.age)
    if (body.branch) updateData.branch = body.branch

    const youth = await prisma.youth.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(youth)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar jovem" }, { status: 500 })
  }
}


export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    const { id } = await params;
    await prisma.youth.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Jovem removido" })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao remover jovem" }, { status: 500 })
  }
}
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth";

export async function PUT(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    const { id } = await params;
    const body = await request.json();
    const updateData: any = {};
    
    if (body.name) updateData.name = body.name;
    if (body.phone) updateData.phone = body.phone;

    const guardian = await prisma.guardian.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(guardian);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar responsável" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    const { id } = await params;
    await prisma.guardian.delete({
      where: { id }
    });
    return NextResponse.json({ message: "Responsável removido com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao remover responsável" }, { status: 500 });
  }
}
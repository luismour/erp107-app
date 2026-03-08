import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updateData: any = {};
    
    if (body.name) updateData.name = body.name;
    if (body.phone) updateData.phone = body.phone;

    const guardian = await prisma.guardian.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(guardian);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar responsável" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.guardian.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ message: "Responsável removido com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao remover responsável" }, { status: 500 });
  }
}
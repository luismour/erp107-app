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
    if (body.status) updateData.status = body.status;
    if (body.amount) updateData.amount = body.amount;

    const updatedFee = await prisma.fee.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedFee);
  } catch (error) {
    console.error("Erro ao processar mensalidade:", error);
    return NextResponse.json({ error: "Erro ao processar mensalidade" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    const { id } = await params;
    await prisma.fee.delete({ where: { id } });
    return NextResponse.json({ message: "Mensalidade removida com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao remover mensalidade" }, { status: 500 });
  }
}
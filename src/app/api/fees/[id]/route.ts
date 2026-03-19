import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: "Acesso Negado." }, { status: 401 })

    const { id } = await params;
    const body = await request.json();

    if (body.status && (body.status.toUpperCase() === 'PAGO' || body.status.toUpperCase() === 'PAID')) {
      
      const currentFee = await prisma.fee.findUnique({
        where: { id }
      });

      if (!currentFee) {
        return NextResponse.json({ error: "Mensalidade não encontrada." }, { status: 404 });
      }

      const olderPendingFee = await prisma.fee.findFirst({
        where: {
          youthId: currentFee.youthId,
          dueDate: {
            lt: currentFee.dueDate 
          },
          status: {
            notIn: ['PAGO', 'paid', 'PAID', 'pago']
          }
        }
      });

      if (olderPendingFee) {
        return NextResponse.json({ 
          error: "Operação bloqueada: Este jovem possui mensalidades mais antigas em atraso. É necessário dar baixa nas mais antigas primeiro." 
        }, { status: 400 });
      }
    }

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
    return NextResponse.json({ error: "Erro interno ao processar mensalidade." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: "Acesso Negado." }, { status: 401 })
      
    const { id } = await params;
    await prisma.fee.delete({ where: { id } });
    return NextResponse.json({ message: "Mensalidade removida com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao remover mensalidade" }, { status: 500 });
  }
}
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const fees = await prisma.fee.findMany({
      include: {
        youth: true 
      },
      orderBy: {
        dueDate: 'desc' 
      }
    });

    return NextResponse.json(fees);
  } catch (error) {
    console.error("Erro ao procurar mensalidades:", error);
    return NextResponse.json({ error: "Erro ao procurar mensalidades" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const fee = await prisma.fee.create({
      data: {
        month: body.month,
        year: body.year,
        amount: body.amount,
        status: body.status || "pending",
        dueDate: new Date(body.dueDate),
        youthId: body.youthId
      }
    });

    return NextResponse.json(fee);
  } catch (error) {
    console.error("Erro ao criar mensalidade:", error);
    return NextResponse.json({ error: "Erro ao criar mensalidade" }, { status: 500 });
  }
}
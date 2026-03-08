import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const guardians = await prisma.guardian.findMany({
      include: {
        youth: true 
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(guardians);
  } catch (error) {
    console.error("Erro ao procurar responsáveis:", error);
    return NextResponse.json({ error: "Erro ao procurar responsáveis" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const guardian = await prisma.guardian.create({
      data: {
        name: body.name,
        phone: body.phone,
        youthId: body.youthId
      }
    });

    return NextResponse.json(guardian);
  } catch (error) {
    console.error("Erro ao criar responsável:", error);
    return NextResponse.json({ error: "Erro ao criar responsável" }, { status: 500 });
  }
}
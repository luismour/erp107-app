import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { sanitizePhone } from "@/lib/utils"
import { getServerSession } from "next-auth"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Acesso Negado. Não autorizado." }, { status: 401 })
    }

    const youths = await prisma.youth.findMany({
      orderBy: {
        createdAt: 'desc' 
      },
      include: {
        guardians: true,
        fees: true,
        funds: true
      }
    });

    return NextResponse.json(youths);
  } catch (error) {
    console.error("Erro ao procurar jovens:", error);
    return NextResponse.json({ error: "Erro ao procurar jovens" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Acesso Negado. Não autorizado." }, { status: 401 })
    }

    const body = await req.json()
    const cleanPhone = sanitizePhone(body.guardianPhone);

    const youth = await prisma.youth.create({
      data: {
        name: body.name,
        age: Number(body.age),
        branch: body.branch,
        guardians: {
          create: {
            name: body.guardianName,
            phone: cleanPhone 
          }
        }
      }
    })

    return NextResponse.json(youth)
  } catch (error) {
    console.error("Erro ao criar jovem:", error);
    return NextResponse.json({ error: "Erro ao criar jovem" }, { status: 500 });
  }
}
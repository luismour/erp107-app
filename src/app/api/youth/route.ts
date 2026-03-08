import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"


export async function GET() {
  try {
    const youths = await prisma.youth.findMany({
      orderBy: {
        createdAt: 'desc' 
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
    const body = await req.json()

    const youth = await prisma.youth.create({
      data: {
        name: body.name,
        age: Number(body.age),
        branch: body.branch,
        guardians: {
          create: {
            name: body.guardianName,
            phone: body.guardianPhone
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
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {

  const guardians = await prisma.guardian.findMany({
    include: {
      youth: true
    }
  })

  return NextResponse.json(guardians)

}

export async function POST(request: Request) {

  const body = await request.json()

  const guardian = await prisma.guardian.create({
    data: {
      name: body.name,
      phone: body.phone,
      youthId: body.youthId
    }
  })

  return NextResponse.json(guardian)

}
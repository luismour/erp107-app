import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {

  const fees = await prisma.fee.findMany({
    include: {
      youth: true
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return NextResponse.json(fees)

}

export async function POST(request: Request) {

  const body = await request.json()

  const fee = await prisma.fee.create({
    data: {
      month: body.month,
      amount: body.amount,
      status: body.status,
      youthId: body.youthId
    }
  })

  return NextResponse.json(fee)

}
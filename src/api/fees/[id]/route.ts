import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {

  const fee = await prisma.fee.findUnique({
    where: {
      id: params.id
    },
    include: {
      youth: true
    }
  })

  return NextResponse.json(fee)

}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {

  const body = await request.json()

  const fee = await prisma.fee.update({
    where: {
      id: params.id
    },
    data: {
      status: body.status
    }
  })

  return NextResponse.json(fee)

}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {

  await prisma.fee.delete({
    where: {
      id: params.id
    }
  })

  return NextResponse.json({ message: "Mensalidade removida" })

}
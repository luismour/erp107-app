import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {

  const guardian = await prisma.guardian.findUnique({
    where: {
      id: params.id
    }
  })

  return NextResponse.json(guardian)

}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {

  const body = await request.json()

  const guardian = await prisma.guardian.update({
    where: {
      id: params.id
    },
    data: {
      name: body.name,
      phone: body.phone
    }
  })

  return NextResponse.json(guardian)

}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {

  await prisma.guardian.delete({
    where: {
      id: params.id
    }
  })

  return NextResponse.json({ message: "Responsável removido" })

}
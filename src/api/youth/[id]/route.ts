import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {

  const youth = await prisma.youth.findUnique({
    where: {
      id: params.id
    },
    include: {
      guardians: true,
      fees: true
    }
  })

  return NextResponse.json(youth)

}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {

  const body = await request.json()

  const youth = await prisma.youth.update({
    where: {
      id: params.id
    },
    data: {
      name: body.name
    }
  })

  return NextResponse.json(youth)

}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {

  await prisma.youth.delete({
    where: {
      id: params.id
    }
  })

  return NextResponse.json({ message: "Jovem removido" })

}
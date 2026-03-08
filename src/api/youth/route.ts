import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {

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

}
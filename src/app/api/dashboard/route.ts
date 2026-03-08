import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {

  try {

    const fees = await prisma.fee.findMany({
      include: {
        youth: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10
    })

    const paidFees = await prisma.fee.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: "paid"
      }
    })

    const pendingFees = await prisma.fee.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: "pending"
      }
    })

    const lateFees = await prisma.fee.count({
      where: {
        status: "late"
      }
    })

    const formattedFees = fees.map((fee: any) => ({
      id: fee.id,
      youth_name: fee.youth.name,
      month: fee.month,
      status: fee.status,
      amount: fee.amount
    }))

    return NextResponse.json({
      fees: formattedFees,
      paid: paidFees._sum.amount || 0,
      pending: pendingFees._sum.amount || 0,
      late: lateFees
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: "Erro ao carregar dashboard" },
      { status: 500 }
    )

  }

}
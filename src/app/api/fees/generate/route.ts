import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: "Acesso Negado." }, { status: 401 })

    const currentDate = new Date()
    let targetMonth = currentDate.getMonth() + 1
    let targetYear = currentDate.getFullYear()
    const currentDay = currentDate.getDate()

    if (currentDay > 10) {
      targetMonth += 1
      if (targetMonth > 12) {
        targetMonth = 1
        targetYear += 1
      }
    }
    
    const dueDate = new Date(Date.UTC(targetYear, targetMonth - 1, 10))

    const youths = await prisma.youth.findMany({
      include: { guardians: true }
    })

    if (youths.length === 0) {
      return NextResponse.json({ error: "Nenhum jovem cadastrado no sistema." }, { status: 400 })
    }

    const existingFees = await prisma.fee.findMany({
      where: { month: targetMonth, year: targetYear }
    })
    const youthsWithFee = new Set(existingFees.map(f => f.youthId))

    const phoneCounts = youths.reduce((acc, curr) => {
      const phone = curr.guardians?.[0]?.phone
      if (phone) acc[phone] = (acc[phone] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    let generatedCount = 0

    for (const youth of youths) {
      if (youthsWithFee.has(youth.id)) continue; 

      const phone = youth.guardians?.[0]?.phone
      const hasSiblings = phone ? phoneCounts[phone] > 1 : false
      const amount = hasSiblings ? 15.00 : 20.00 

      await prisma.fee.create({
        data: {
          youthId: youth.id,
          month: targetMonth,
          year: targetYear,
          amount: amount,
          status: 'pending',
          dueDate: dueDate
        }
      })
      generatedCount++
    }

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const targetMonthName = monthNames[targetMonth - 1];

    return NextResponse.json({ 
      message: `Lote de ${targetMonthName}/${targetYear} gerado com sucesso! (${generatedCount} novos registos)`, 
      count: generatedCount 
    }, { status: 201 })

  } catch (error) {
    console.error("Erro ao gerar mensalidades:", error)
    return NextResponse.json({ error: "Erro interno ao gerar mensalidades." }, { status: 500 })
  }
}
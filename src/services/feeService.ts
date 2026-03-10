import { prisma } from "@/lib/prisma"

export function getBusinessDay(year: number, month: number, targetDay: number = 5): Date {
  const date = new Date(year, month - 1, 1)
  let businessDaysCount = 0

  while (businessDaysCount < targetDay) {
    const dayOfWeek = date.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDaysCount++
    }
    if (businessDaysCount < targetDay) {
      date.setDate(date.getDate() + 1)
    }
  }
  date.setHours(0, 0, 0, 0)
  return date
}

export async function generateMonthlyFees(month: number, year: number) {
  const BASE_VALUE = 20.00
  
  let nextMonth = month + 1
  let nextYear = year
  if (nextMonth > 12) {
    nextMonth = 1
    nextYear++
  }
  
  const dueDate = getBusinessDay(nextYear, nextMonth, 5)

  try {
    const youths = await prisma.youth.findMany({
      include: {
        guardians: true
      }
    })

    const feePromises = youths.map(async (youth) => {
      const existingFee = await prisma.fee.findFirst({
        where: { 
          youthId: youth.id, 
          month, 
          year 
        }
      })

      if (existingFee) return
      const familyPhone = youth.guardians[0]?.phone
      let finalAmount = BASE_VALUE

      if (familyPhone) {
        const siblingsCount = await prisma.youth.count({
          where: {
            guardians: {
              some: { phone: familyPhone }
            }
          }
        })

        if (siblingsCount === 2) {
          finalAmount = 15.00 
        } else if (siblingsCount >= 3) {
          finalAmount = 10.00 
        }
      }

      return prisma.fee.create({
        data: {
          youthId: youth.id,
          month,
          year,
          amount: finalAmount,
          status: "pending",
          dueDate: dueDate
        }
      })
    })

    await Promise.all(feePromises)
    console.log(`✅ Mensalidades de ${month}/${year} geradas com sucesso.`)
    
  } catch (error) {
    console.error("❌ Erro ao gerar mensalidades:", error)
    throw error
  }
}
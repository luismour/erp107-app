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

  let nextMonth = month + 1
  let nextYear = year
  
  if (nextMonth > 12) {
    nextMonth = 1
    nextYear++
  }

  const dueDate = getBusinessDay(nextYear, nextMonth, 5)

  try {
    const youths = await prisma.youth.findMany()

    const feePromises = youths.map(async (youth) => {
      const existingFee = await prisma.fee.findFirst({
        where: { youthId: youth.id, month, year }
      })

      if (!existingFee) {
        return prisma.fee.create({
          data: {
            youthId: youth.id,
            month,
            year,
            amount: 20.00, 
            status: "pending",
            dueDate: dueDate
          }
        })
      }
    })

    await Promise.all(feePromises)
    console.log(`Mensalidades de ${month}/${year} geradas com sucesso. Vencimento: ${dueDate.toLocaleDateString()}`)
  } catch (error) {
    console.error("Erro no feeService:", error)
    throw error
  }
}
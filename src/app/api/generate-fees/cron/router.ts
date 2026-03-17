import { NextResponse } from "next/server"
import { generateMonthlyFees, getBusinessDay } from "@/services/feeService"
import { getServerSession } from "next-auth";

export async function GET(request: Request) {
  const session = await getServerSession()
  const authHeader = request.headers.get('authorization');
  
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const fifthBusinessDay = getBusinessDay(currentYear, currentMonth, 5)

  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  if (today.getTime() === fifthBusinessDay.getTime()) {
    try {
      await generateMonthlyFees(currentMonth, currentYear)
      return NextResponse.json({ 
        success: true, 
        message: "Mensalidades geradas com sucesso hoje (5º dia útil)!" 
      })
    } catch (error) {
      return NextResponse.json({ success: false, error }, { status: 500 })
    }
  } else {
   
    return NextResponse.json({ 
      success: true, 
      message: `Hoje não é o 5º dia útil. Geração ignorada. O 5º dia útil é ${fifthBusinessDay.toLocaleDateString()}` 
    })
  }
}
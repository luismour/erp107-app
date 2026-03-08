import { NextResponse } from "next/server"
import { generateMonthlyFees } from "@/services/feeService"

export async function POST() {

  const now = new Date()

  const month = now.getMonth() + 1
  const year = now.getFullYear()

  try {

    await generateMonthlyFees(month, year)

    return NextResponse.json({
      success: true
    })

  } catch (error) {

    return NextResponse.json({
      success: false,
      error
    })

  }

}
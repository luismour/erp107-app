import { supabase } from "@/lib/supabaseClient"

export async function generateMonthlyFees(month: number, year: number) {

  // buscar jovens ativos
  const { data: youths, error } = await supabase
    .from("youth_members")
    .select("*")
    .eq("active", true)

  if (error) {
    throw error
  }

  const fees = youths.map((youth) => ({
    youth_id: youth.id,
    month,
    year,
    amount: 20, // valor da mensalidade
    status: "pending"
  }))

  const { error: insertError } = await supabase
    .from("monthly_fees")
    .insert(fees)

  if (insertError) {
    throw insertError
  }

  return true
}
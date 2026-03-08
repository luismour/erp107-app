export interface MonthlyFee {
  id: string
  youth_id: string
  month: number
  year: number
  amount: number
  status: "pendente" | "pago" | "atrasado"
  payment_method?: string
  paid_at?: string
}
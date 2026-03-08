"use client"

import { useEffect, useState } from "react"

interface Fee {
  id: string
  month: number
  year: number
  amount: number
  status: string
}

export default function FeesPage(){

  const [fees,setFees] = useState<Fee[]>([])

  async function loadFees(){

    const res = await fetch("/api/fees")

    const data = await res.json()

    setFees(data)

  }

  useEffect(()=>{
    loadFees()
  },[])

  return (

    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Mensalidades
      </h1>

      <div className="card">

        <table className="w-full">

          <thead className="border-b">
            <tr>
              <th>Mês</th>
              <th>Ano</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {fees.map((fee)=>(
              <tr key={fee.id} className="border-b">

                <td>{fee.month}</td>
                <td>{fee.year}</td>
                <td>R$ {fee.amount}</td>

                <td>

                  {fee.status === "paid" && (
                    <span className="text-green-600">
                      Pago
                    </span>
                  )}

                  {fee.status === "pending" && (
                    <span className="text-yellow-600">
                      Pendente
                    </span>
                  )}

                  {fee.status === "late" && (
                    <span className="text-red-600">
                      Atrasado
                    </span>
                  )}

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}
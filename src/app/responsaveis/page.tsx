"use client"

import { useEffect, useState } from "react"

interface Guardian {
  id: string
  name: string
  phone: string
}

export default function GuardiansPage() {

  const [guardians,setGuardians] = useState<Guardian[]>([])

  async function loadGuardians(){

    const res = await fetch("/api/guardian")

    const data = await res.json()

    setGuardians(data)

  }

  useEffect(()=>{
    loadGuardians()
  },[])

  return (

    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Responsáveis
      </h1>

      <div className="card">

        {guardians.map(g=>(
          <div
            key={g.id}
            className="flex justify-between border-b p-3"
          >

            <div>
              <p>{g.name}</p>
              <p className="text-sm text-gray-500">
                {g.phone}
              </p>
            </div>

          </div>
        ))}

      </div>

    </div>

  )
}
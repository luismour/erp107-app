"use client"

import { useState } from "react"

export default function YouthPage(){

  const [form,setForm] = useState({
    name:"",
    age:"",
    branch:"",
    guardianName:"",
    guardianPhone:""
  })

  async function handleSubmit(e:any){

    e.preventDefault()

    await fetch("/api/youth",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify(form)
    })

    alert("Jovem cadastrado!")

    setForm({
      name:"",
      age:"",
      branch:"",
      guardianName:"",
      guardianPhone:""
    })

  }

  return(

    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Inscrição de Jovem
      </h1>

      <form
        onSubmit={handleSubmit}
        className="card p-6 space-y-4 max-w-md"
      >

        <input
          placeholder="Nome do jovem"
          className="input"
          value={form.name}
          onChange={(e)=>setForm({...form,name:e.target.value})}
        />

        <input
          placeholder="Idade"
          type="number"
          className="input"
          value={form.age}
          onChange={(e)=>setForm({...form,age:e.target.value})}
        />

        <select
          className="input"
          value={form.branch}
          onChange={(e)=>setForm({...form,branch:e.target.value})}
        >

          <option value="">Selecione o ramo</option>
          <option value="lobinho">Lobinho</option>
          <option value="escoteiro">Escoteiro</option>
          <option value="senior">Sênior</option>
          <option value="pioneiro">Pioneiro</option>

        </select>

        <input
          placeholder="Nome do responsável"
          className="input"
          value={form.guardianName}
          onChange={(e)=>setForm({...form,guardianName:e.target.value})}
        />

        <input
          placeholder="Telefone do responsável"
          className="input"
          value={form.guardianPhone}
          onChange={(e)=>setForm({...form,guardianPhone:e.target.value})}
        />

        <button className="btn-primary">
          Cadastrar jovem
        </button>

      </form>

    </div>

  )

}
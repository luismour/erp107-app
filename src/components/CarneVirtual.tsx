"use client"

import { X, Printer, Download } from "lucide-react"
import Image from "next/image"

interface CarneProps {
  fee: any
  youth: any
  onClose: () => void
}

export default function CarneVirtual({ fee, youth, onClose }: CarneProps) {
  if (!fee || !youth) return null

  const branches = [
    { id: "Lobinho", img: "/Logo_ramo_lobinho_principal.png" },
    { id: "Escoteiro", img: "/Logo_ramo_escoteiro_principal.png" },
    { id: "Sênior", img: "/Logo_ramo_senior_principal.png" },
    { id: "Pioneiro", img: "/Logo_ramo_pioneiro_principal.png" },
  ]

  const branchImg = branches.find(b => b.id === youth.branch)?.img || ""

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden print:shadow-none print:rounded-none">
        
        {/* Header - Escondido na Impressão */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 print:hidden">
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Carnê Virtual</h2>
          <div className="flex gap-3">
            <button 
              onClick={() => window.print()} 
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all"
            >
              <Printer size={18} /> Imprimir / PDF
            </button>
            <button onClick={onClose} className="p-2.5 bg-white border rounded-xl hover:bg-gray-100 transition-all">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* ÁREA DO CARNÊ (O que será impresso) */}
        <div className="p-10 bg-white print:p-4">
          <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden print:border-solid print:border-black print:rounded-none">
            
            {/* CANHOTO */}
            <div className="w-full md:w-1/3 border-r-2 border-dashed border-gray-200 pr-8 flex flex-col justify-between print:border-black">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 relative">
                    <Image src={branchImg} alt="Ramo" fill className="object-contain" />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase">Recibo Pagador</span>
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 leading-tight">{youth.name}</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">{youth.branch}</p>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-gray-100 space-y-3">
                <p className="text-[9px] font-black text-gray-400 uppercase">Vencimento: <span className="text-gray-900 ml-1">{new Date(fee.dueDate).toLocaleDateString()}</span></p>
                <p className="text-[9px] font-black text-gray-400 uppercase">Valor: <span className="text-emerald-700 ml-1">R$ {fee.amount.toFixed(2)}</span></p>
                <div className="h-12 w-full bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Autenticação Mecânica</span>
                </div>
              </div>
            </div>

            {/* CORPO PRINCIPAL */}
            <div className="w-full md:w-2/3 flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 italic">107º/PE Grupo Escoteiro</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Padre Roma</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Referência</p>
                  <p className="text-xl font-black text-gray-900">{String(fee.month).padStart(2,'0')}/{fee.year}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Pagador</p>
                  <p className="text-sm font-bold text-gray-800 uppercase">{youth.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Data Emissão</p>
                  <p className="text-sm font-bold text-gray-800">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex justify-between items-center py-6 border-y-2 border-gray-50">
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase">Vencimento</p>
                  <p className="text-2xl font-black text-gray-900">{new Date(fee.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black text-emerald-600 uppercase">Total a Pagar</p>
                  <p className="text-4xl font-black text-emerald-800 tracking-tighter">R$ {fee.amount.toFixed(2)}</p>
                </div>
              </div>

              {/* Linha Digitável / Código de Barras Decorativo */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="h-8 w-full bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_4px)] opacity-20"></div>
                <p className="text-[9px] font-mono text-center text-gray-400">
                  {fee.id.toUpperCase().replace(/-/g, ' ')}
                </p>
              </div>
            </div>

            {/* Marca d'água de fundo */}
            <div className="absolute -right-10 -bottom-10 opacity-[0.03] pointer-events-none">
              <Image src={branchImg} alt="watermark" width={300} height={300} />
            </div>
          </div>
          
          <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-8 px-10 leading-relaxed">
            Atenção: Este documento é para controle interno. O pagamento deve ser efetuado via PIX oficial do grupo e o comprovante enviado ao tesoureiro.
          </p>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, QrCode, Printer, ShieldCheck, Calendar, User, Scissors, MessageCircle, Loader2 } from "lucide-react"
import Image from "next/image"

interface CarneVirtualProps {
  youthName: string;
  branch: string;
  amount: number;
  dueDate: string;
  guardianName: string;
  phone?: string;
  onClose: () => void;
}

export default function CarneVirtual({ youthName, branch, amount, dueDate, guardianName, phone, onClose }: CarneVirtualProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleCombo = async () => {
    setIsGenerating(true)
    try {
      const element = document.getElementById('carne-render')
      if (!element) { alert("Erro: Layout não encontrado."); setIsGenerating(false); return }
      
      const html2pdf = (await import('html2pdf.js')).default
      const opt = {
        margin: 5,
        filename: `Carne_GE107_${youthName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      }

      await html2pdf().set(opt).from(element).save()

      if (phone) {
        const cleanPhone = phone.replace(/\D/g, '')
        const message = `Olá! Tudo bem? ⚜️ Aqui é do Grupo Escoteiro 107º Padre Roma. Passando rapidinho para lembrar que a mensalidade do(a) jovem ${youthName} (R$ ${amount.toFixed(2)}) encontra-se em aberto.\n\nEstou enviando o seu carnê em anexo para facilitar o pagamento via PIX. Quando puder, dá um alô aqui para a nossa Tesouraria, tá bom? Muito obrigado e Sempre Alerta! ⛺`
        const encodedMessage = encodeURIComponent(message)
        setTimeout(() => { window.open(`https://wa.me/55${cleanPhone}?text=${encodedMessage}`, '_blank') }, 800)
      } else {
        alert("PDF Baixado! (Este jovem não possui telefone registado para o WhatsApp).")
      }
    } catch (error) {
      console.error(error)
      alert("Erro ao gerar o PDF.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="relative z-50">
      <style type="text/css" media="print">
        {`@page { size: A4 portrait; margin: 10mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }`}
      </style>

      <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 print:hidden transition-colors">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          className="bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 max-w-sm md:max-w-4xl w-full shadow-2xl relative overflow-hidden transition-colors"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase transition-colors">Carnê Virtual</h2>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                <QrCode size={12} /> Pagamento via PIX
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button onClick={handleCombo} disabled={isGenerating || !phone} className="text-white hover:bg-emerald-600 transition-colors px-4 py-2 bg-emerald-500 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed">
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />} Baixar PDF & Enviar 
              </button>
              <button onClick={() => window.print()} className="text-emerald-600 dark:text-emerald-500 hover:text-white dark:hover:text-white hover:bg-emerald-500 transition-colors px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
                <Printer size={16} /> Imprimir
              </button>
              <button onClick={onClose} className="text-slate-500 hover:text-red-500 transition-colors p-2 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 relative z-10 flex flex-col md:flex-row overflow-hidden transition-colors">
            <div className="p-8 md:w-2/3 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-colors">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <ShieldCheck className="text-emerald-500" size={32} />
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase tracking-tight leading-none transition-colors">Grupo Escoteiro 107º</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Padre Roma • Contribuição Associativa</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Beneficiário / Jovem</p>
                    <p className="font-black text-xl text-slate-800 dark:text-slate-200 uppercase flex items-center gap-2 tracking-tight transition-colors"><User size={18} className="text-slate-400 dark:text-slate-600" /> {youthName}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 p-4 bg-white dark:bg-[#1a1f2e] rounded-xl border border-slate-200 dark:border-slate-800/50 transition-colors">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ramo</p>
                      <span className="font-bold text-slate-700 dark:text-slate-300 uppercase transition-colors">{branch}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Vencimento</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-2"><Calendar size={14} /> {dueDate}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Responsável Financeiro</p>
                    <p className="font-bold text-slate-600 dark:text-slate-400 uppercase transition-colors">{guardianName}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800/50 transition-colors">
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-relaxed">Pagamento exclusivo via PIX. A contribuição mensal mantém as atividades e a estrutura do nosso grupo.</p>
              </div>
            </div>

            <div className="p-8 md:w-1/3 flex flex-col items-center justify-center bg-white dark:bg-[#1a1f2e] text-center transition-colors">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Valor da Mensalidade</p>
              <p className="text-4xl font-black text-emerald-600 dark:text-emerald-500 italic tracking-tighter">R$ {amount.toFixed(2)}</p>

              <div className="my-6 bg-white p-3 rounded-2xl border-4 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)] flex items-center justify-center">
                <Image src="/qrcode-pix.png" alt="QR Code PIX Tesouraria" width={160} height={160} className="object-contain" unoptimized />
              </div>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Abra a app do seu banco e<br/>faça a leitura do código acima</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute -left-[9999px] -top-[9999px] print:static print:left-auto print:top-auto">
        <div id="carne-render" className="flex w-full max-w-[190mm] mx-auto bg-[#ffffff] text-[#000000] border-2 border-[#000000] rounded-lg relative break-inside-avoid shadow-none">
          <div className="absolute -top-5 left-[28%] text-[#9ca3af] flex items-center gap-1 text-[10px] tracking-widest uppercase"><Scissors size={14} className="rotate-180" /> Corte na linha pontilhada</div>
          <div className="w-[28%] border-r-2 border-dashed border-[#9ca3af] p-3 flex flex-col justify-between shrink-0">
            <div>
              <h4 className="font-black text-[10px] uppercase text-center border-b-2 border-[#000000] pb-2 mb-2 tracking-widest">Recibo do Pagador</h4>
              <div className="mb-2"><div className="text-[8px] uppercase font-bold text-[#6b7280]">Vencimento</div><div className="font-black text-xs text-[#000000]">{dueDate}</div></div>
              <div className="mb-2"><div className="text-[8px] uppercase font-bold text-[#6b7280]">Valor do Documento</div><div className="font-black text-base text-[#000000]">R$ {amount.toFixed(2)}</div></div>
              <div className="mb-2"><div className="text-[8px] uppercase font-bold text-[#6b7280]">Referente a</div><div className="font-bold text-[10px] uppercase leading-tight break-words text-[#000000]">{youthName}</div><div className="text-[9px] text-[#4b5563] mt-0.5">RAMO {branch.toUpperCase()}</div></div>
              <div className="mb-1"><div className="text-[8px] uppercase font-bold text-[#6b7280]">Pagador</div><div className="font-bold text-[9px] uppercase leading-tight line-clamp-2 text-[#000000]">{guardianName}</div></div>
            </div>
            <div className="text-[7px] text-[#6b7280] text-center border-t border-[#d1d5db] pt-1 font-bold uppercase mt-2">G. E. 107º Padre Roma</div>
          </div>
          <div className="w-[72%] p-4 flex flex-col shrink-0">
            <div className="flex justify-between items-end border-b-2 border-[#000000] pb-2 mb-2">
              <div className="flex items-center gap-2"><ShieldCheck size={24} className="text-[#000000]" /><div><h2 className="font-black text-lg leading-none uppercase tracking-tight text-[#000000]">Grupo Escoteiro 107º</h2><p className="text-[8px] font-bold uppercase tracking-widest text-[#4b5563] mt-0.5">Contribuição Associativa Mensal</p></div></div>
              <div className="font-black text-xl border-l-2 border-[#000000] pl-2 tracking-tighter text-[#000000]">PIX</div>
            </div>
            <div className="flex w-full flex-1 mt-1">
              <div className="w-[70%] pr-3 flex flex-col justify-start">
                <div className="grid grid-cols-2 gap-2 border-b border-[#d1d5db] pb-1.5 mb-1.5"><div><div className="text-[7px] font-bold uppercase text-[#6b7280]">Beneficiário</div><div className="text-[9px] font-black uppercase text-[#000000]">G. E. 107º Padre Roma</div></div><div><div className="text-[7px] font-bold uppercase text-[#6b7280]">Vencimento</div><div className="text-[9px] font-black uppercase text-[#000000]">{dueDate}</div></div></div>
                <div className="border-b border-[#d1d5db] pb-1.5 mb-1.5"><div className="text-[7px] font-bold uppercase text-[#6b7280]">Pagador (Responsável Financeiro)</div><div className="text-[9px] font-bold uppercase break-words text-[#000000]">{guardianName}</div></div>
                <div className="border-b border-[#d1d5db] pb-1.5 mb-1.5"><div className="text-[7px] font-bold uppercase text-[#6b7280]">Jovem / Ramo</div><div className="text-[9px] font-bold uppercase break-words text-[#000000]">{youthName} — Ramo {branch}</div></div>
                <div className="pt-1"><div className="text-[7px] font-bold uppercase text-[#6b7280] mb-0.5">Instruções para Pagamento</div><div className="text-[7px] font-medium leading-relaxed text-[#1f2937]">1. Abra a aplicação do seu banco e aceda à área PIX.<br/>2. Selecione a opção "Ler QR Code".<br/>3. Aponte a câmara para o código ao lado.<br/>4. Envie o comprovativo para a Tesouraria.</div></div>
              </div>
              <div className="w-[30%] flex flex-col items-center border-l border-[#d1d5db] pl-3 justify-center gap-2">
                <div className="w-full text-center bg-[#f3f4f6] p-1.5 rounded-lg border border-[#e5e7eb]"><div className="text-[7px] font-bold uppercase text-[#6b7280] mb-0.5">Valor a Pagar</div><div className="text-sm font-black text-[#000000]">R$ {(amount).toFixed(2)}</div></div>
                <div className="border-2 border-[#000000] rounded-xl p-1 w-full flex items-center justify-center bg-[#ffffff] aspect-square"><img src="/qrcode-pix.png" alt="QR Code PIX" className="w-full h-full object-contain" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
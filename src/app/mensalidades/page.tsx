"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Loader2, MessageCircle, FileSpreadsheet, CalendarDays, CreditCard, CalendarPlus, QrCode, CheckCircle } from "lucide-react"
import BranchFilter from "@/components/BranchFilter"
import CarneVirtual from "@/components/CarneVirtual"
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export default function MensalidadesPage() {
  const [youths, setYouths] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  const [selectedCarneYouth, setSelectedCarneYouth] = useState<any | null>(null)

  async function loadData() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/youth")
      const data = await res.json()
      
      const enrichedData = data.map((youth: any) => {
        const latestFee = youth.fees && youth.fees.length > 0 
          ? youth.fees.sort((a: any, b: any) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0]
          : null;

        return {
          ...youth,
          allFees: youth.fees || [],
          guardianName: youth.guardians?.[0]?.name || "Responsável não cadastrado",
          mensalidade: latestFee ? {
            id: latestFee.id,
            status: latestFee.status,
            dueDate: new Date(latestFee.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
            amount: Number(latestFee.amount),
            phone: youth.guardians?.[0]?.phone || ""
          } : {
            status: "SEM REGISTRO",
            dueDate: "-",
            amount: youth.branch === "Lobinho" ? 15.00 : 10.00,
            phone: youth.guardians?.[0]?.phone || ""
          }
        }
      })
      
      setYouths(enrichedData)
    } catch {
      setYouths([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleGenerateFees = async () => {
    if (!confirm("Deseja gerar as mensalidades deste mês para todos os jovens ativos?")) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-fees", { method: "POST" });
      if (res.ok) {
        alert("Mensalidades geradas com sucesso!");
        await loadData();
      } else {
        alert("Ocorreu um erro ao gerar as mensalidades.");
      }
    } catch (error) {
      alert("Erro de conexão ao tentar gerar mensalidades.");
    } finally {
      setIsGenerating(false);
    }
  }

  const handleConfirmPayment = async (feeId: string) => {
    if (!confirm("Tem certeza que deseja confirmar o pagamento desta mensalidade?")) return;
    try {
      const res = await fetch(`/api/fees/${feeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAGO' })
      });
      if (res.ok) {
        await loadData();
      } else {
        alert("Ocorreu um erro ao confirmar o pagamento.");
      }
    } catch (error) {
      alert("Erro de conexão com o servidor.");
    }
  }

  const handleExportHistory = async () => {
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'GE 107 Padre Roma';
      
      const groupedByMonth: Record<string, any[]> = {}

      youths.forEach(youth => {
        if (!youth.allFees || youth.allFees.length === 0) return;

        youth.allFees.forEach((fee: any) => {
          const date = new Date(fee.dueDate)
          const month = String(date.getUTCMonth() + 1).padStart(2, '0')
          const year = date.getUTCFullYear()
          const sheetName = `${month}-${year}`

          if (!groupedByMonth[sheetName]) {
            groupedByMonth[sheetName] = []
          }

          const statusLabel = fee.status.toUpperCase() === "PAGO" || fee.status.toUpperCase() === "PAID" 
            ? "PAGO" 
            : (fee.status.toUpperCase() === "LATE" ? "ATRASADO" : "ABERTO")

          groupedByMonth[sheetName].push({
            name: youth.name,
            branch: youth.branch,
            dueDate: date.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
            amount: Number(fee.amount),
            status: statusLabel
          })
        })
      })

      const sheetNames = Object.keys(groupedByMonth)
      if (sheetNames.length === 0) {
        alert("Nenhum histórico de mensalidade encontrado.")
        setIsExporting(false);
        return
      }

      sheetNames.sort((a, b) => {
        const [mA, yA] = a.split('-').map(Number)
        const [mB, yB] = b.split('-').map(Number)
        return (yB * 12 + mB) - (yA * 12 + mA)
      })

      sheetNames.forEach(monthKey => {
        const ws = workbook.addWorksheet(`Mensalidades ${monthKey}`);

        ws.columns = [
          { header: 'Nome do Jovem', key: 'name', width: 35 },
          { header: 'Ramo', key: 'branch', width: 18 },
          { header: 'Vencimento', key: 'dueDate', width: 15 },
          { header: 'Valor Pago/Devido', key: 'amount', width: 22 },
          { header: 'Status', key: 'status', width: 18 }
        ];

        const headerRow = ws.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;

        ws.autoFilter = 'A1:E1';

        groupedByMonth[monthKey].forEach(item => {
          const row = ws.addRow(item);

          row.getCell('amount').numFmt = '"R$" #,##0.00';
          row.getCell('amount').alignment = { horizontal: 'right' };
          
          row.getCell('branch').alignment = { horizontal: 'center' };
          row.getCell('dueDate').alignment = { horizontal: 'center' };

          const statusCell = row.getCell('status');
          statusCell.alignment = { horizontal: 'center' };
          statusCell.font = { bold: true };
          
          if (item.status === 'PAGO') {
            statusCell.font = { color: { argb: 'FF10B981' }, bold: true }; 
          } else if (item.status === 'ATRASADO') {
            statusCell.font = { color: { argb: 'FFEF4444' }, bold: true }; 
          } else {
            statusCell.font = { color: { argb: 'FFF59E0B' }, bold: true }; 
          }

          row.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
          });
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, "Historico_Mensalidades_GE107.xlsx");

    } catch (error) {
      console.error(error);
      alert("Erro ao exportar a planilha.");
    } finally {
      setIsExporting(false);
    }
  }

  const handleWhatsApp = (name: string, phone: string, amount: number) => {
    if (!phone) return
    const cleanPhone = phone.replace(/\D/g, '')
    const emojiFlor = String.fromCodePoint(0x269C, 0xFE0F);
    const emojiBarraca = String.fromCodePoint(0x26FA);
    const message = `Olá! Tudo bem? ${emojiFlor} Aqui é do Grupo Escoteiro 107º Padre Roma. Passando rapidinho para lembrar que a mensalidade do(a) jovem ${name} (R$ ${amount.toFixed(2)}) encontra-se em aberto. Quando puder, dá um alô aqui para a nossa Tesouraria para a gente acertar, tá bom? Qualquer dúvida, é só falar. Muito obrigado e Sempre Alerta! ${emojiBarraca}`
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const filteredYouths = youths.filter(y => {
    const matchesSearch = y.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBranch = selectedBranch ? y.branch === selectedBranch : true
    return matchesSearch && matchesBranch
  })

  const getStatusStyle = (status: string) => {
    const s = String(status).toUpperCase();
    if (s === "ABERTO" || s === "PENDING" || s === "LATE") return "bg-amber-500/10 text-amber-500 border-amber-500/20"
    if (s === "PAGO" || s === "PAID") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    return "bg-slate-800/50 text-slate-400 border-slate-700"
  }

  const getStatusText = (status: string) => {
    const s = String(status).toUpperCase();
    if (s === "PENDING" || s === "ABERTO") return "ABERTO"
    if (s === "PAID" || s === "PAGO") return "PAGO"
    if (s === "LATE") return "ATRASADO"
    return status
  }

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 min-h-screen print:hidden">
        <div className="bg-[#1a1f2e] p-8 rounded-[32px] border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center xl:text-left w-full xl:w-auto">
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Mensalidades</h1>
            <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-1 flex items-center justify-center xl:justify-start gap-2">
              <CalendarDays size={14} className="text-emerald-500" /> Controle de Arrecadação
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 w-full xl:w-auto relative z-10 justify-end items-center">
            <div className="relative group w-full lg:w-64 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Buscar jovem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#0f172a] border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 w-full font-medium transition-all"
              />
            </div>
            
            <button 
              onClick={handleGenerateFees}
              disabled={isGenerating || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-blue-600/20 w-full lg:w-auto disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <CalendarPlus size={16} />} 
              Gerar Lote do Mês
            </button>

            <button 
              onClick={handleExportHistory}
              disabled={isExporting}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-emerald-500/20 w-full lg:w-auto disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />} 
              Histórico em Excel
            </button>
          </div>
        </div>

        <BranchFilter selectedBranch={selectedBranch} onSelect={setSelectedBranch} />

        <div className="bg-[#1a1f2e] rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0f172a]/50 text-slate-500 uppercase text-[10px] font-black tracking-[0.2em] border-b border-slate-800">
                <tr>
                  <th className="px-10 py-6">Jovem / Ramo</th>
                  <th className="px-10 py-6">Vencimento</th>
                  <th className="px-10 py-6">Estado</th>
                  <th className="px-10 py-6 text-right">Ações / Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {isLoading ? (
                  <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={32} /></td></tr>
                ) : filteredYouths.length === 0 ? (
                  <tr><td colSpan={4} className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest">Nenhum registro encontrado</td></tr>
                ) : filteredYouths.map((youth) => {
                  const isPaid = youth.mensalidade.status.toUpperCase() === "PAGO" || youth.mensalidade.status.toUpperCase() === "PAID";
                  const isPending = youth.mensalidade.status.toUpperCase() === "ABERTO" || youth.mensalidade.status.toUpperCase() === "PENDING" || youth.mensalidade.status.toUpperCase() === "LATE";
                  
                  return (
                    <tr key={youth.id} className="group hover:bg-[#1e293b]/50 transition-all">
                      <td className="px-10 py-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#0f172a] border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <p className="font-black text-slate-100 text-sm uppercase tracking-tight">{youth.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{youth.branch}</p>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <p className="text-slate-400 font-bold italic">{youth.mensalidade.dueDate}</p>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(youth.mensalidade.status)}`}>
                          {getStatusText(youth.mensalidade.status)}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {youth.mensalidade.id && !isPaid && youth.mensalidade.status !== "SEM REGISTRO" && (
                            <button 
                              onClick={() => handleConfirmPayment(youth.mensalidade.id)}
                              title="Confirmar Pagamento (Dar Baixa)"
                              className="w-8 h-8 rounded-full bg-blue-500/10 hover:bg-blue-500 border border-blue-500/20 hover:border-blue-500 text-blue-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedCarneYouth(youth)}
                            title="Abrir Carnê Virtual"
                            className="w-8 h-8 rounded-full bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-500 text-emerald-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                          >
                            <QrCode size={14} />
                          </button>
                          {isPending && youth.mensalidade.phone && (
                            <button 
                              onClick={() => handleWhatsApp(youth.name, youth.mensalidade.phone, youth.mensalidade.amount)}
                              title="Cobrar via WhatsApp"
                              className="w-8 h-8 rounded-full bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 hover:border-amber-500 text-amber-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                            >
                              <MessageCircle size={14} />
                            </button>
                          )}
                          <p className="font-black text-white text-lg italic min-w-[80px]">
                            R$ {youth.mensalidade.amount.toFixed(2)}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedCarneYouth && (
          <CarneVirtual
            youthName={selectedCarneYouth.name}
            branch={selectedCarneYouth.branch}
            amount={selectedCarneYouth.mensalidade.amount}
            dueDate={selectedCarneYouth.mensalidade.dueDate}
            guardianName={selectedCarneYouth.guardianName}
            phone={selectedCarneYouth.mensalidade.phone}
            onClose={() => setSelectedCarneYouth(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
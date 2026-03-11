"use client"

import { motion } from "framer-motion"
import { Filter } from "lucide-react"

interface BranchFilterProps {
  selectedBranch: string | null;
  onSelect: (branch: string | null) => void;
}

export default function BranchFilter({ selectedBranch, onSelect }: BranchFilterProps) {
  const branches = ["Lobinho", "Escoteiro", "Sênior", "Pioneiro"]

  return (
    <div className="flex items-center gap-4 bg-[#0f172a] p-2 rounded-2xl border border-slate-800 overflow-x-auto w-fit shadow-lg hide-scrollbar">
      <div className="pl-3 pr-2 text-slate-600">
        <Filter size={16} />
      </div>
      
      <div className="flex gap-1 relative">
        <button
          onClick={() => onSelect(null)}
          className={`relative px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors z-10 ${!selectedBranch ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          {!selectedBranch && (
            <motion.div 
              layoutId="activeFilterBranch" 
              className="absolute inset-0 bg-[#1a1f2e] border border-slate-700/50 rounded-xl shadow-md -z-10" 
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} 
            />
          )}
          Todos
        </button>

        {branches.map(branch => (
          <button
            key={branch}
            onClick={() => onSelect(branch)}
            className={`relative px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors z-10 ${selectedBranch === branch ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {selectedBranch === branch && (
              <motion.div 
                layoutId="activeFilterBranch" 
                className="absolute inset-0 bg-[#1a1f2e] border border-slate-700/50 rounded-xl shadow-md -z-10" 
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} 
              />
            )}
            {branch}
          </button>
        ))}
      </div>
    </div>
  )
}
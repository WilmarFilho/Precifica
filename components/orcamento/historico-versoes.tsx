'use client';

import { Database } from "@/lib/database.types";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react"; // Adicionado para gerenciar loading

type Versao = Database['public']['Tables']['orcamento_versoes']['Row'];

export function HistoricoVersoes({ versoes }: { versoes: Versao[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const versaoAtivaId = searchParams.get('v') || versoes[0]?.id;

  const handleTrocarVersao = (versaoId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('v', versaoId);

    // startTransition avisa ao Next.js que uma mudança de estado está ocorrendo
    // Isso geralmente aciona o NextTopLoader se configurado corretamente
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className={`flex flex-wrap gap-2 mb-6 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-full mb-1">
        Histórico de Versões (Clique para visualizar)
      </p>
      {versoes.map((v) => {
        const isSelected = v.id === versaoAtivaId;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => handleTrocarVersao(v.id)}
            className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-2 ${isSelected
                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"
              }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-blue-500"}`}></span>
            <span className="text-xs font-bold font-mono">v{v.versao_numero}</span>
            <span className={`text-[9px] ${isSelected ? "text-blue-100" : "text-zinc-600"}`}>
              {new Date(v.created_at!).toLocaleDateString('pt-BR')}
            </span>
          </button>
        );
      })}
    </div>
  );
}
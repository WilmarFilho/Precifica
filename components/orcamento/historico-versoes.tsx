// components/orcamento/historico-versoes.tsx
import { Database } from "@/lib/database.types";

type Versao = Database['public']['Tables']['orcamento_versoes']['Row'];

export function HistoricoVersoes({ versoes }: { versoes: Versao[] }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-full mb-1">
        Histórico de Versões
      </p>
      {versoes.map((v) => (
        <button
          key={v.id}
          type="button"
          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:border-blue-500 hover:text-white transition flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Versão {v.versao_numero}
          <span className="text-[9px] text-zinc-600">
            {new Date(v.created_at!).toLocaleDateString('pt-BR')}
          </span>
        </button>
      ))}
    </div>
  );
}
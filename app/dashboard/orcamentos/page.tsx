export const dynamic = "force-dynamic";

import { DashboardHeader } from "@/components/dashboard-header";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardOrcamentosPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/autenticacao/entrar');

  const query = (await searchParams).q || "";

  const { data: clientes } = await supabase.from('clientes').select('id, nome');
  const clientesMap = new Map((clientes || []).map(c => [c.id, c.nome]));
  
  const idsClientesFiltrados = (clientes || [])
    .filter(c => c.nome.toLowerCase().includes(query.toLowerCase()))
    .map(c => c.id);

  let orcamentosQuery = supabase
    .from('orcamentos')
    .select('id, titulo, cliente_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (query) {
    const filterParts = [`titulo.ilike.%${query}%`];
    if (idsClientesFiltrados.length > 0) {
      filterParts.push(`cliente_id.in.(${idsClientesFiltrados.join(',')})`);
    }
    orcamentosQuery = orcamentosQuery.or(filterParts.join(','));
  }

  const { data: orcamentos } = await orcamentosQuery;

  return (
    // O segredo do alinhamento está nestes paddings (px-6 md:px-10) que devem bater com o conteúdo do Header
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8">
      <DashboardHeader />
        
        {/* Barra de Busca */}
        <div className="px-8 flex flex-col md:flex-row items-center gap-4 mb-10 w-full">
          <Link href="/dashboard/orcamentos/novo" className="w-full md:w-auto">
            <button className="w-full md:w-auto bg-blue-600 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition uppercase text-xs flex items-center justify-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
               Novo Orçamento
            </button>
          </Link>

          <form method="GET" className="flex-1 w-full relative">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Buscar por título ou nome do cliente..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
            />
            <svg className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
        </div>

        {/* Grid de Cards */}
        <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(orcamentos || []).map((orc) => (
            <div key={orc.id} className="group bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition flex flex-col gap-4">
              <div className="flex-1">
                <div className="font-black text-xl text-white group-hover:text-blue-400 transition mb-1 line-clamp-2">{orc.titulo}</div>
                <div className="text-zinc-400 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                  Cliente: <span className="text-zinc-200">{clientesMap.get(orc.cliente_id) || "Desconhecido"}</span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-zinc-800/50">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  {orc.created_at ? new Date(orc.created_at).toLocaleDateString('pt-BR') : '-'}
                </span>
                <Link href={`/dashboard/orcamentos/${orc.id}`} className="px-4 py-2 rounded-lg bg-zinc-800 text-white text-[10px] font-bold uppercase hover:bg-zinc-700 transition">
                  Ver Detalhes
                </Link>
              </div>
            </div>
          ))}
        </div>
    
    </div>
  );
}
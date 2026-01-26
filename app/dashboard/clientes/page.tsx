export const dynamic = "force-dynamic";

import { DashboardHeader } from "@/components/dashboard-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NovoClienteModal } from "@/components/modal/novo-cliente-modal";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = await createClient();

  // 1. Verificação de Autenticação
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/autenticacao/entrar');

  // 2. Termo de Busca
  const query = (await searchParams).q || "";

  // 3. Busca no Supabase
  let dbQuery = supabase
    .from('clientes')
    .select('id, nome, created_at')
    .eq('user_id', user.id)
    .order('nome', { ascending: true });

  if (query) {
    dbQuery = dbQuery.ilike('nome', `%${query}%`);
  }

  const { data: clientes } = await dbQuery;

  return (
    // CONTÊINER PAI: px-4 md:px-8 para alinhar perfeitamente com a borda externa do Header
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8">
      <DashboardHeader />
        
      {/* SUB-CONTÊINER: px-2 para alinhar o conteúdo interno com o texto interno do Header */}
      <div className="px-2">
        
        {/* BARRA DE AÇÕES E BUSCA */}
        <div className="px-8  flex flex-col md:flex-row items-center gap-4 mb-10 w-full mt-10">
          
          {/* BOTÃO QUE ABRE O MODAL (Substituindo o Link antigo) */}
          <NovoClienteModal />

          <form method="GET" className="flex-1 w-full relative">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Buscar clientes pelo nome..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition placeholder:text-zinc-600"
            />
            <svg className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
        </div>

        {/* GRID DE CLIENTES */}
        <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientes && clientes.length > 0 ? (
            clientes.map((cliente) => (
              <div 
                key={cliente.id} 
                className="group bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition flex flex-col gap-4 min-h-[160px]"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-600/20 transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">
                    ID: {cliente.id.toString().slice(0, 8)}...
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="font-black text-xl text-white group-hover:text-blue-400 transition mb-1">
                    {cliente.nome}
                  </h3>
                  <p className="text-zinc-500 text-xs">
                    Cliente desde: {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-zinc-800/50 flex justify-end">
                  
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-24 border-2 border-dashed border-zinc-800 rounded-3xl">
              <p className="text-zinc-500 font-medium">Nenhum cliente encontrado.</p>
              {query && (
                <Link href="/dashboard/clientes" className="text-blue-500 text-[10px] uppercase font-bold mt-2 inline-block hover:underline tracking-widest">
                  Limpar busca
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
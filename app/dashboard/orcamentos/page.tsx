export const dynamic = "force-dynamic";


import { DashboardHeader } from "@/components/dashboard-header";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardOrcamentosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/autenticacao/entrar');

  // Busca orçamentos do usuário logado
  const { data: orcamentos } = await supabase
    .from('orcamentos')
    .select('id, titulo, cliente_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Busca clientes para exibir nome
  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome');
  const clientesMap = new Map((clientes || []).map(c => [c.id, c.nome]));

  return (
    <div className="max-w-7xl mx-auto py-8">
      <DashboardHeader />
      <div className="flex items-center gap-4 mb-6 w-full">
        <Link href="/dashboard/orcamentos/novo">
          <button className="bg-primary text-black font-semibold px-5 py-2 rounded-lg shadow hover:bg-primary/90 transition">Novo Orçamento</button>
        </Link>
        <input
          type="text"
          placeholder="Buscar orçamentos..."
          className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(orcamentos || []).map((orc) => (
          <div key={orc.id} className="bg-card border rounded-xl p-6 shadow flex flex-col gap-2">
            <div className="font-bold text-lg text-foreground">{orc.titulo}</div>
            <div className="text-muted-foreground">Cliente: {clientesMap.get(orc.cliente_id) || orc.cliente_id}</div>
            <div className="text-xs text-muted-foreground">Criado em: {orc.created_at ? new Date(orc.created_at).toLocaleDateString('pt-BR') : '-'}</div>
            <Link href={`/dashboard/orcamentos/${orc.id}`} className="mt-2 self-end px-4 py-1 rounded bg-primary text-black font-medium hover:bg-primary/90 transition text-center">
              Ver detalhes
            </Link>
          </div>
        ))}
        {(orcamentos?.length === 0) && (
          <div className="col-span-full text-center text-zinc-500 py-12">Nenhum orçamento encontrado.</div>
        )}
      </div>
    </div>
  );
}
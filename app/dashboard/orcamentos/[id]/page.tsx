export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from '@/components/dashboard-header';
import { GradeOrcamento } from '@/components/orcamento/grade-orcamento';
import { HistoricoVersoes } from '@/components/orcamento/historico-versoes';
import { salvarFluxoOrcamento } from "../actions/salvarFluxoOrcamento";

export default async function OrcamentoPage({ 
  params, 
  searchParams 
}: { 
  params: { id: string }, 
  searchParams: { v?: string } 
}) {
  const { id } = await params;
  const { v: versaoIdSolicitada } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/autenticacao/entrar');

  const { data: clientes } = await supabase.from('clientes').select('id, nome').order('nome');

  let insumosParaGrade = [];
  let orcamentoExistente = null;
  let versoes = [];
  let quantidadesIniciais = [1000, 3000, 5000];

  if (id === 'novo') {
    const { data: insumosBase } = await supabase.from('insumos_base').select('*').order('categoria');
    insumosParaGrade = insumosBase?.map(i => ({ ...i, id: String(i.id), custo_unitario: 0 })) || [];
  } else {
    // 1. Busca Orçamento e todas as versões
    const { data: orc } = await supabase.from('orcamentos').select('*').eq('id', id).single();
    const { data: vList } = await supabase.from('orcamento_versoes').select('*').eq('orcamento_id', id).order('versao_numero', { ascending: false });
    
    orcamentoExistente = orc;
    versoes = vList || [];

    // 2. Define qual versão carregar (a clicada ou a mais recente)
    const versaoParaCarregar = versaoIdSolicitada 
      ? versoes.find(v => v.id === versaoIdSolicitada) 
      : versoes[0];

      console.log(versaoParaCarregar)
    if (versaoParaCarregar) {
        console.log('oi')
      const { data: valores } = await supabase
        .from('orcamento_versao_valores')
        .select('*, insumos_base(nome, categoria)')
        .eq('versao_id', versaoParaCarregar.id);
      console.log(valores)
      if (valores && valores.length > 0) {
        quantidadesIniciais = [...new Set(valores.map(val => val.quantidade_referencia))].sort((a, b) => a - b);
        
        const uniqueIds = [...new Set(valores.map(val => val.insumo_id))];
        insumosParaGrade = uniqueIds.map(insId => {
          const item = valores.find(val => val.insumo_id === insId);
          return {
            id: String(insId),
            nome: item.insumos_base.nome,
            categoria: item.insumos_base.categoria || 'Geral',
            custo_unitario: item.valor_custo_unitario_base
          };
        });

        console.log(insumosParaGrade);
      }
    }
  }

  async function handleSalvar(formData: FormData) {
    'use server';
    const payload = {
      titulo: formData.get('titulo') as string, // Permite alterar o nome
      clienteId: formData.get('clienteId') as string,
      valores: JSON.parse(formData.get('valores') as string),
      userId: user!.id,
      markup: Number(formData.get('markup')),
      ...(id !== 'novo' ? { orcamentoId: id } : {})
    };

    await salvarFluxoOrcamento(payload);
    redirect('/dashboard/orcamentos');
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20">
      <DashboardHeader />
      
      <form action={handleSalvar} className="max-w-7xl mx-auto px-6 py-8">
        <header className="flex justify-between items-center mb-10">
          <div className="flex-1 mr-8">
            {/* Input de Título editável */}
            <input 
              name="titulo" 
              defaultValue={orcamentoExistente?.titulo} 
              placeholder="Nome do Orçamento..."
              className="bg-transparent text-3xl font-bold text-white border-b border-transparent focus:border-blue-500 outline-none w-full transition-colors"
              required 
            />
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-2">
              ID: {id === 'novo' ? 'Gerando...' : id}
            </p>
          </div>
          
          <button type="submit" className="px-8 py-4 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition text-xs uppercase flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            Salvar Nova Versão
          </button>
        </header>

        {versoes.length > 0 && <HistoricoVersoes versoes={versoes} />}

        <section className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50 mb-8">
           <div className="max-w-xs">
            <label className="text-[10px] font-bold uppercase text-zinc-500 mb-2 block tracking-widest">Cliente Associado</label>
            <select 
              name="clienteId" 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 outline-none appearance-none cursor-pointer text-sm" 
              defaultValue={orcamentoExistente?.cliente_id || ""} 
              required
            >
              <option value="" disabled>Selecione um cliente...</option>
              {clientes?.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
        </section>

        <GradeOrcamento 
          insumosIniciais={insumosParaGrade} 
          quantidadesPadrao={quantidadesIniciais} 
          markupInicial={30}
        />
      </form>
    </div>
  );
}
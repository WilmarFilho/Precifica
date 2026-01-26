export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from '@/components/dashboard-header';
import { GradeOrcamento } from '@/components/orcamento/grade-orcamento';
import { salvarFluxoOrcamento } from "../actions/salvarFluxoOrcamento";
import { revalidatePath } from 'next/cache';


export default async function OrcamentoPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/autenticacao/entrar');

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome')
    .order('nome');

  interface InsumoParaGrade {
    id: number;
    nome: string;
    categoria: string;
    custo_unitario: number;
    quantidade_referencia?: number;
  }

  interface OrcamentoExistente {
    id: number;
    titulo: string;
    cliente_id: string;
    // Add other fields as needed based on your table structure
  }

  let insumosParaGrade: InsumoParaGrade[] = [];
  let orcamentoExistente: OrcamentoExistente | null = null;

  if (id === 'novo') {
    const { data: insumosBase } = await supabase.from('insumos_base').select('*').order('categoria');
    insumosParaGrade = insumosBase?.map(i => ({ ...i, custo_unitario: 0 })) || [];
  } else {
    const { data: orc } = await supabase.from('orcamentos').select('*').eq('id', id).single();
    if (orc) {
      orcamentoExistente = orc;
      const { data: valores } = await supabase
        .from('orcamento_versao_valores')
        .select('*, insumos_base(nome, categoria)')
        .eq('orcamento_id', id);
      
      insumosParaGrade = valores?.map(v => ({
        id: v.insumo_id,
        nome: v.insumos_base.nome,
        categoria: v.insumos_base.categoria,
        custo_unitario: v.valor_custo_unitario_base
      })) || [];
    }
  }

  async function handleSalvar(formData: FormData) {
    'use server';
    const payload = {
      titulo: formData.get('titulo') as string,
      clienteId: formData.get('clienteId') as string,
      valores: JSON.parse(formData.get('valores') as string),
      // Só define orcamentoId se orcamentoExistente não for null
      ...(orcamentoExistente ? { orcamentoId: String(orcamentoExistente.id) } : {}),
      userId: user!.id,
      markup: Number(formData.get('markup')) || 0,
    };

    if (!payload.titulo || !payload.clienteId) return; // Validação extra no servidor

    await salvarFluxoOrcamento(payload);
    revalidatePath('/dashboard/orcamentos');
    redirect('/dashboard/orcamentos');
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20">
      <DashboardHeader />
      
      <form action={handleSalvar} className="max-w-7xl mx-auto px-6 py-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white italic underline decoration-blue-500/30">
              {id === 'novo' ? 'Novo Projeto' : orcamentoExistente?.titulo}
            </h1>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium">Editor de Precificação Gráfica</p>
          </div>
          
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 font-bold hover:text-white transition shadow-sm text-xs uppercase tracking-tighter">
              Salvar Rascunho
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition text-xs uppercase tracking-tighter">
              Gerar Orçamento Final
            </button>
            
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50">
          <div className="lg:col-span-2 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Nome do Orçamento</label>
            <input 
              name="titulo" 
              defaultValue={orcamentoExistente?.titulo} 
              placeholder="Ex: 5.000 Panfletos - Campanha Verão" 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-lg focus:ring-2 focus:ring-blue-500/50 outline-none transition placeholder:text-zinc-800 font-medium"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Cliente Solicitante</label>
            <select 
              name="clienteId" 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer text-zinc-300 font-medium"
              defaultValue={orcamentoExistente?.cliente_id || ""}
              required
            >
              <option value="" disabled>Selecione o Cliente...</option>
              {clientes?.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
        </section>

        <GradeOrcamento 
          insumosIniciais={insumosParaGrade.map(i => ({ ...i, id: String(i.id) }))} 
          quantidadesPadrao={id === 'novo' ? [1000, 3000, 5000] : insumosParaGrade.map(i => i.quantidade_referencia).filter((q): q is number => typeof q === 'number')} 
          markupInicial={30}
        />
      </form>
    </div>
  );
}
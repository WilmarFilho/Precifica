export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from '@/components/dashboard-header';
import { GradeOrcamento } from '@/components/orcamento/grade-orcamento';
import { HistoricoVersoes } from '@/components/orcamento/historico-versoes';
import { salvarFluxoOrcamento } from "../actions/salvarFluxoOrcamento";
import { atualizarTituloOrcamento } from "@/app/dashboard/orcamentos/actions/atualizarTitulo";
import { BotaoSalvar } from '@/components/ui/botaoSalvar';

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

    const { data: tiposPapel } = await supabase
        .from('tipos_papel')
        .select('*')
        .order('nome');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/autenticacao/entrar');

    const { data: clientes } = await supabase.from('clientes').select('id, nome').order('nome');

    let insumosParaGrade = [];
    let orcamentoExistente: { id: string; titulo: string; cliente_id: string } | null = null;
    let versoes = [];
    let quantidadesIniciais = [1000, 3000, 5000];

    if (id === 'novo') {
        const { data: insumosBase } = await supabase.from('insumos_base').select('*').order('categoria');
        insumosParaGrade = insumosBase?.map(i => ({ ...i, id: String(i.id), custo_unitario: 0 })) || [];
    } else {
        const { data: orc } = await supabase.from('orcamentos').select('*').eq('id', id).single();
        const { data: vList } = await supabase.from('orcamento_versoes').select('*').eq('orcamento_id', id).order('versao_numero', { ascending: false });

        orcamentoExistente = orc;
        versoes = vList || [];

        const versaoParaCarregar = versaoIdSolicitada
            ? versoes.find(v => v.id === versaoIdSolicitada)
            : versoes[0];

        if (versaoParaCarregar) {
            const { data: valores } = await supabase
                .from('orcamento_versao_valores')
                .select('*, insumos_base(nome, categoria)')
                .eq('versao_id', versaoParaCarregar.id);

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
            }
        }
    }

    async function handleSalvarVersao(formData: FormData) {
        'use server';

        const gradeDadosRaw = formData.get('grade_dados') as string;
        if (!gradeDadosRaw) return;
        const { markup, valores } = JSON.parse(gradeDadosRaw);

        // Agora pegamos o 'titulo' que vem do input conectado via ID de formulário
        const tituloFinal = formData.get('titulo') as string || "Novo Orçamento";

        const payload = {
            titulo: tituloFinal,
            clienteId: formData.get('clienteId') as string,
            valores: valores,
            userId: user!.id,
            markup: markup,
            ...(id !== 'novo' ? { orcamentoId: id } : {})
        };

        await salvarFluxoOrcamento(payload);
        // Use the Next.js redirect instead of router.push in a server action
        redirect('/dashboard/orcamentos');
    }

    async function handleUpdateTitle(formData: FormData) {
        'use server';
        const novoTitulo = formData.get('titulo') as string;
        if (id !== 'novo' && novoTitulo) {
            await atualizarTituloOrcamento(id, novoTitulo);
        }
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8">
            <DashboardHeader />

            <div className="sm:hidden flex flex-col items-center justify-center text-center py-20 px-6 bg-zinc-900/50 rounded-3xl border border-zinc-800 my-8">
                <h2 className="text-white font-bold text-xl mb-2">Tela muito pequena</h2>
                <p className="text-zinc-500 text-sm leading-relaxed">
                    A grade de orçamentos requer mais espaço horizontal.
                </p>
            </div>

            <main className="hidden sm:block max-w-7xl mx-auto px-6 py-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 bg-zinc-900/20 p-6 rounded-2xl border border-zinc-800/50">
                    <div className="flex-1 w-full group">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1 block">
                            Nome do Orçamento
                        </label>
                        <form action={handleUpdateTitle} className="flex items-center gap-4">
                            <input
                                name="titulo"
                                form="form-principal" // CONECTA este campo ao formulário de salvar abaixo
                                defaultValue={orcamentoExistente?.titulo}
                                placeholder="Ex: Cartão de Visita Premium..."
                                className="bg-transparent text-3xl font-black text-white border-b-2 border-transparent focus:border-blue-500 outline-none transition-all py-1 flex-1"
                                required
                            />
                            {id !== 'novo' && (
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold uppercase border border-zinc-700 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                                >
                                    Atualizar Nome
                                </button>
                            )}
                        </form>
                    </div>

                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">ID do Registro</p>
                        <p className="font-mono text-zinc-500 text-xs">{id === 'novo' ? 'PENDENTE' : id}</p>
                    </div>
                </header>

                {versoes.length > 0 && <HistoricoVersoes versoes={versoes} />}

                <form action={handleSalvarVersao} id="form-principal">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                        <section className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50 flex-1 w-full md:max-w-md">
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
                        </section>

                        <BotaoSalvar />
                    </div>

                    <GradeOrcamento
                        tiposPapel={tiposPapel || []}
                        insumosIniciais={insumosParaGrade}
                        quantidadesPadrao={quantidadesIniciais}
                        markupInicial={30}
                    />
                </form>
            </main>
        </div>
    );
}
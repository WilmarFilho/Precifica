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
    searchParams: { v?: string, edit?: string }
}) {
    const { id } = await params;
    const { v: versaoIdSolicitada, edit } = await searchParams;
    const supabase = await createClient();

    const isVisualizandoHistorico = !!versaoIdSolicitada && edit !== 'true';

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
    let quantidadesIniciais = [100]; // Padrão para novo orçamento é apenas 100

    // 1. Carrega SEMPRE todos os insumos base primeiro
    const { data: todosInsumosBase } = await supabase
        .from('insumos_base')
        .select('*')
        .order('categoria');

    if (id === 'novo') {
        // Para novo orçamento: todos os insumos com custo 0
        insumosParaGrade = todosInsumosBase?.map(i => ({
            ...i,
            id: String(i.id),
            custo_unitario: 0
        })) || [];
    } else {

        // BUSCAR COLUNAS SALVAS
        const { data: colunasSalvas } = await supabase
            .from('orcamento_colunas')
            .select('quantidade')
            .eq('orcamento_id', id)
            .order('ordem', { ascending: true });

        // Se houver colunas no banco, usa elas, senão usa [100]
        quantidadesIniciais = colunasSalvas && colunasSalvas.length > 0
            ? colunasSalvas.map(c => c.quantidade)
            : [100];

        const { data: orc } = await supabase.from('orcamentos').select('*').eq('id', id).single();
        const { data: vList } = await supabase.from('orcamento_versoes').select('*').eq('orcamento_id', id).order('versao_numero', { ascending: false });

        orcamentoExistente = orc;
        versoes = vList || [];

        // Se tiver v na URL, usa ela. Se não (ou se for ?edit=true vindo do dashboard), entre na tela de criar nova versão
        const versaoParaCarregar = versaoIdSolicitada
            ? versoes.find(v => v.id === versaoIdSolicitada)
            : null;

        if (versaoParaCarregar) {
            const { data: valoresSalvos } = await supabase
                .from('orcamento_versao_valores')
                .select('*')
                .eq('versao_id', versaoParaCarregar.id);


            // Mapeia TODOS os insumos base, injetando o valor salvo onde houver
            insumosParaGrade = (todosInsumosBase || []).map(base => {
                const valorSalvo = valoresSalvos?.find(v => v.insumo_id === base.id);
                return {
                    id: String(base.id),
                    nome: base.nome,
                    categoria: base.categoria || 'Geral',
                    // Se achou valor no banco, usa ele. Se não, custo 0 para o novo rascunho.
                    custo_unitario: valorSalvo ? valorSalvo.valor_custo_unitario_base : 0
                };
            });
        } else {
            // Fallback caso o orçamento exista mas não tenha versões (segurança)
            insumosParaGrade = todosInsumosBase?.map(i => ({ ...i, id: String(i.id), custo_unitario: 0 })) || [];
        }
    }

    async function handleSalvarVersao(formData: FormData) {
        'use server';
        const gradeDadosRaw = formData.get('grade_dados') as string;
        if (!gradeDadosRaw) return;
        const { markup, valores, quantidadesVisiveis } = JSON.parse(gradeDadosRaw);
        const tituloFinal = formData.get('titulo') as string || "Novo Orçamento";

        const payload = {
            titulo: tituloFinal,
            clienteId: formData.get('clienteId') as string,
            valores: valores,
            quantidadesVisiveis: quantidadesVisiveis,
            userId: user!.id,
            markup: markup,
            ...(id !== 'novo' ? { orcamentoId: id } : {}),
        };

        await salvarFluxoOrcamento(payload);
        redirect(`/dashboard/orcamentos/${id !== 'novo' ? id : ''}`);
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

            <main className="hidden sm:block max-w-7xl mx-auto px-6 py-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 bg-zinc-900/20 p-6 rounded-2xl border border-zinc-800/50">
                    <div className="flex-1 w-full group">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1 block">
                            Nome do Orçamento
                        </label>
                        <form action={handleUpdateTitle} className="flex items-center gap-4">
                            <input
                                name="titulo"
                                // REMOVA A LINHA ABAIXO:
                                // form="form-principal" 
                                defaultValue={orcamentoExistente?.titulo}
                                placeholder="Ex: Cartão de Visita Premium..."
                                className="bg-transparent text-3xl font-black text-white border-b-2 border-transparent focus:border-blue-500 outline-none transition-all py-1 flex-1"
                                required
                                disabled={isVisualizandoHistorico}
                            />
                            {id !== 'novo' && !isVisualizandoHistorico && (
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold uppercase border border-zinc-700 transition"
                                >
                                    Atualizar Nome
                                </button>
                            )}
                        </form>
                    </div>
                </header>

                {versoes.length > 0 && (
                    <HistoricoVersoes
                        versoes={versoes}
                    />
                )}

                <form action={handleSalvarVersao} id="form-principal">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                        <section className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50 flex-1 w-full md:max-w-md">
                            <label className="text-[10px] font-bold uppercase text-zinc-500 mb-2 block tracking-widest">Cliente Associado</label>
                            <select
                                name="clienteId"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 outline-none appearance-none cursor-pointer text-sm disabled:opacity-50"
                                defaultValue={orcamentoExistente?.cliente_id || ""}
                                required
                                disabled={isVisualizandoHistorico}
                            >
                                <option value="" disabled>Selecione um cliente...</option>
                                {clientes?.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                            </select>
                        </section>

                        {/* Só exibe o botão salvar se não estiver visualizando histórico antigo */}
                        {!isVisualizandoHistorico && <BotaoSalvar />}
                    </div>

                    <GradeOrcamento
                        tiposPapel={tiposPapel || []}
                        insumosIniciais={insumosParaGrade}
                        quantidadesPadrao={quantidadesIniciais}
                        markupInicial={30}
                        readOnly={isVisualizandoHistorico} // Passa o estado de leitura
                    />
                </form>
            </main>
        </div>
    );
}




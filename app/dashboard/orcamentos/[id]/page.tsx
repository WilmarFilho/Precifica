export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from '@/components/dashboard-header';
import { GradeOrcamento } from '@/components/orcamento/grade-orcamento';
import { HistoricoVersoes } from '@/components/orcamento/historico-versoes';
import { salvarFluxoOrcamento } from "../actions/salvarFluxoOrcamento";
import { atualizarTituloOrcamento } from "@/app/dashboard/orcamentos/actions/atualizarTitulo";
import { BotaoSalvar } from '@/components/ui/botaoSalvar';
import { BotaoExportarPDF } from '@/components/orcamento/BotaoExportarPDF';

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

    const [
        { data: tiposPapel },
        { data: wireo },
        { data: espiral },
        { data: acessorios }
    ] = await Promise.all([
        supabase.from('tipos_papel').select('*').order('nome'),
        supabase.from('insumos_wireo').select('*').order('preco_caixa_base'),
        supabase.from('insumos_espiral').select('*').order('tamanho_mm'),
        supabase.from('insumos_acessorios').select('*').order('nome')
    ]);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/autenticacao/entrar');

    const { data: clientes } = await supabase.from('clientes').select('id, nome').order('nome');

    let orcamentoExistente: { id: string; titulo: string; cliente_id: string } | null = null;
    // Lógica para encontrar o nome do cliente atual para o PDF
    const clienteAtual = clientes?.find(c => c.id === orcamentoExistente?.cliente_id);

    let insumosParaGrade = [];
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

            {/* AVISO PARA TELAS PEQUENAS (MOBILE) */}
            {/* Visível apenas abaixo de 640px (sm) */}
            <div className="sm:hidden flex flex-col items-center justify-center text-center py-20 px-6">
                <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
                    <div className="bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Tela muito pequena</h2>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        A ferramenta de orçamentos utiliza uma grade complexa de cálculos que requer mais espaço horizontal. 
                        <br /><br />
                        Por favor, <strong>acesse através de um computador</strong> ou tablet em modo paisagem.
                    </p>
                </div>
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

                        {isVisualizandoHistorico ? (
                            <BotaoExportarPDF 
                                projeto={orcamentoExistente?.titulo}
                                cliente={clienteAtual?.nome}
                                usuario={user?.email}
                                versao={versaoIdSolicitada}
                            />
                        ) : (
                            <BotaoSalvar />
                        )}
                    </div>

                    <GradeOrcamento
                        wireoOptions={wireo || []}
                        espiralOptions={espiral || []}
                        acessoriosOptions={acessorios || []}
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




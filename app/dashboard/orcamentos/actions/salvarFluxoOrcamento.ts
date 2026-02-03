"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/database.types";
import { redirect } from "next/navigation"; // 1. Importar o redirect

type VersaoInsert = Database['public']['Tables']['orcamento_versoes']['Insert'];

interface FluxoOrcamentoPayload {
  orcamentoId?: string;
  clienteId: string;
  titulo: string;
  userId: string;
  markup: number;
  quantidadesVisiveis: number[];
  valores: Array<{
    insumo_id: string;
    quantidade_referencia: number;
    valor_custo_unitario_base: number;
  }>;
}

export async function salvarFluxoOrcamento(payload: FluxoOrcamentoPayload) {
  const supabase = await createClient();
  let orcamentoId = payload.orcamentoId;

  // 1. Criar Orçamento Base
  if (!orcamentoId) {
    const { data: orcamento, error: orcError } = await supabase
      .from("orcamentos")
      .insert({
        cliente_id: payload.clienteId,
        titulo: payload.titulo,
        user_id: payload.userId,
      })
      .select().single();

    if (orcError || !orcamento) throw new Error("Erro ao criar orçamento");
    orcamentoId = orcamento.id;
  }

  // 2. Incrementar número da versão
  const { data: versoes } = await supabase
    .from("orcamento_versoes")
    .select("versao_numero")
    .eq("orcamento_id", orcamentoId)
    .order("versao_numero", { ascending: false })
    .limit(1);

  const nextVersao = (versoes?.[0]?.versao_numero || 0) + 1;

  // 3. Criar a Versão
  const { data: versao, error: vError } = await supabase
    .from("orcamento_versoes")
    .insert({
      orcamento_id: orcamentoId,
      versao_numero: nextVersao,
      descricao_alteracao: `Cálculo gerado em ${new Date().toLocaleString('pt-BR')}`,
    } as VersaoInsert)
    .select().single();

  if (vError || !versao) throw new Error("Erro ao criar versão");

  if (!payload.valores || !Array.isArray(payload.valores)) {
    throw new Error("Os valores da grade são obrigatórios.");
  }

  // 4. Salvar Valores
  const valoresInsert = payload.valores.map((v) => ({
    versao_id: versao.id,
    insumo_id: v.insumo_id,
    valor_custo_unitario_base: v.valor_custo_unitario_base,
    quantidade_referencia: v.quantidade_referencia 
  }));

  const { error: valError } = await supabase
    .from("orcamento_versao_valores")
    .insert(valoresInsert);

  if (valError) throw new Error(`Erro ao salvar valores: ${valError.message}`);

  // 5. Atualizar as Colunas do Orçamento
  const quantidadesUnicas = payload.quantidadesVisiveis;

  await supabase.from("orcamento_colunas").delete().eq("orcamento_id", orcamentoId);
  
  const { error: colError } = await supabase.from("orcamento_colunas").insert(
    quantidadesUnicas.map((qtd, index) => ({
      orcamento_id: orcamentoId,
      quantidade: qtd,
      ordem: index
    }))
  );

  if (colError) throw new Error(`Erro ao atualizar colunas: ${colError.message}`);

  // 6. Revalidar e Redirecionar
  revalidatePath(`/dashboard/orcamentos/${orcamentoId}`);
  
  // Redireciona para o orçamento com o ID da versão recém criada no parâmetro 'v'
  // Note que NÃO passamos 'edit=true' para que ele caia em modo de visualização
  redirect(`/dashboard/orcamentos/${orcamentoId}?v=${versao.id}`);
}
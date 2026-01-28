"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/database.types";

type VersaoInsert = Database['public']['Tables']['orcamento_versoes']['Insert'];
type ValorInsert = Database['public']['Tables']['orcamento_versao_valores']['Insert'];

interface FluxoOrcamentoPayload {
  orcamentoId?: string;
  clienteId: string;
  titulo: string; // Usado apenas na criação do primeiro registro
  userId: string;
  markup: number;
  valores: Array<{
    insumo_id: string;
    quantidade_referencia: number;
    valor_custo_unitario_base: number;
  }>;
}

export async function salvarFluxoOrcamento(payload: FluxoOrcamentoPayload) {
  const supabase = await createClient();
  let orcamentoId = payload.orcamentoId;

  // 1. Criar Orçamento Base (Apenas se for novo)
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

  // 3. Criar a Versão (Histórico imutável)
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
     throw new Error("Os valores da grade são obrigatórios e devem ser um array.");
  }
    
  // 4. Inserir os Valores na Grade
  const valoresInsert: ValorInsert[] = payload.valores.map((v) => ({
    versao_id: versao.id,
    insumo_id: v.insumo_id,
    quantidade_referencia: v.quantidade_referencia,
    valor_custo_unitario_base: v.valor_custo_unitario_base,
  }));

  const { error: valError } = await supabase
    .from("orcamento_versao_valores")
    .insert(valoresInsert);

  if (valError) throw new Error(`Erro ao salvar valores: ${valError.message}`);

  revalidatePath(`/dashboard/orcamentos/${orcamentoId}`);
  return { ok: true, orcamentoId };
}
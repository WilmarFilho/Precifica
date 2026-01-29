"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// No arquivo atualizarTitulo.ts

export async function atualizarTituloOrcamento(id: string, novoTitulo: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orcamentos")
    .update({ titulo: novoTitulo })
    .eq("id", id);

  if (error) throw new Error("Erro ao atualizar título");

  // Garanta que o caminho está correto (verifique se a pasta é /orcamentos ou /orcamento)
  revalidatePath(`/dashboard/orcamentos/${id}`);
  
  return { ok: true };
}
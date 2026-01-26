"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function atualizarTituloOrcamento(id: string, novoTitulo: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orcamentos")
    .update({ titulo: novoTitulo })
    .eq("id", id);

  if (error) throw new Error("Erro ao atualizar título");

  revalidatePath(`/dashboard/orcamentos/${id}`);
  return { ok: true };
}
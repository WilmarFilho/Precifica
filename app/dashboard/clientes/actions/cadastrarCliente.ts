"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  nome: z.string().min(2),
});

export async function cadastrarCliente(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.nome?.[0] || "Dados inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("clientes").insert({
    nome: parsed.data.nome,
    // O Supabase RLS deve garantir o auth.uid() automaticamente
  });
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/dashboard/clientes");
  return { success: true };
}

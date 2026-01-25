import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/database.types";

export async function listarClientes(busca: string = "") {
  const supabase = await createClient();
  let query = supabase.from("clientes").select("id, nome, created_at").order("created_at", { ascending: false });
  if (busca) {
    query = query.ilike("nome", `%${busca}%`);
  }
  const { data, error } = await query;
  if (error) return [];
  return data as Pick<Database["public"]["Tables"]["clientes"]["Row"], "id" | "nome" | "created_at">[];
}

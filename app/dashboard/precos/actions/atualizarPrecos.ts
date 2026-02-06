"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function atualizarPrecosInsumos(dados: any[]) {
    const supabase = await createClient();

    for (const item of dados) {
        if (item.tipo === 'papel') {
            await supabase.from('tipos_papel').update({ 
                f1: item.f1, f2: item.f2, f3: item.f3, f4: item.f4, 
                f6: item.f6, f8: item.f8, f9: item.f9 
            }).eq('id', item.id);
        } else if (item.tipo === 'wireo') {
            await supabase.from('insumos_wireo').update({ 
                preco_caixa_base: item.preco_caixa_base,
                preco_caixa_especial: item.preco_caixa_especial 
            }).eq('id', item.id);
        } else if (item.tipo === 'espiral') {
            await supabase.from('insumos_espiral').update({ 
                preco_cento: item.preco_cento 
            }).eq('id', item.id);
        } else if (item.tipo === 'acessorio') {
            await supabase.from('insumos_acessorios').update({ 
                custo_unitario: item.custo_unitario 
            }).eq('id', item.id);
        }
    }

    revalidatePath('/dashboard/precos');
    return { ok: true };
}
'use client';

import React, { useState, useMemo } from 'react';

interface Insumo {
  id: string;
  nome: string;
  categoria: string;
  custo_unitario: number;
}

interface GradeOrcamentoProps {
  insumosIniciais: Insumo[];
  quantidadesPadrao: number[];
  markupInicial: number;
}

export function GradeOrcamento({ insumosIniciais, quantidadesPadrao, markupInicial }: GradeOrcamentoProps) {
  const [quantidades, setQuantidades] = useState<number[]>(quantidadesPadrao);
  const [markup, setMarkup] = useState<number>(markupInicial);
  const [custos, setCustos] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    insumosIniciais.forEach((i) => init[i.id] = i.custo_unitario);
    return init;
  });

  const categorias = useMemo(() => {
    const groups: Record<string, Insumo[]> = {};
    insumosIniciais.forEach((i) => {
      const cat = i.categoria || 'Outros';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(i);
    });
    return groups;
  }, [insumosIniciais]);

  const totaisCusto = useMemo(() => {
    return quantidades.map(q => 
      insumosIniciais.reduce((acc, insumo) => acc + ((custos[insumo.id] || 0) / 100) * q, 0)
    );
  }, [custos, quantidades, insumosIniciais]);

  const payloadValores = useMemo(() => {
    return JSON.stringify(
      quantidades.flatMap(q => 
        insumosIniciais.map(insumo => ({
          insumo_id: insumo.id,
          quantidade_referencia: q,
          valor_custo_unitario_base: custos[insumo.id] || 0
        }))
      )
    );
  }, [custos, quantidades, insumosIniciais]);

  return (
    <div className="space-y-6">
      <input type="hidden" name="valores" value={payloadValores} />
      <input type="hidden" name="markup" value={markup} />

      <div className="flex justify-between items-center bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-4">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Markup (%)</label>
          <input 
            type="number" 
            value={markup} 
            onChange={(e) => setMarkup(Number(e.target.value))}
            className="bg-zinc-950 border border-zinc-700 rounded px-3 py-1 w-20 text-blue-400 font-bold"
          />
        </div>
        <button 
          type="button"
          onClick={() => setQuantidades([...quantidades, (quantidades[quantidades.length-1] || 0) + 500])}
          className="text-[10px] bg-zinc-800 px-4 py-2 rounded-lg font-bold hover:bg-zinc-700 transition"
        >
          + Adicionar Quantidade
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800 shadow-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-500 uppercase text-[10px] font-bold">
            <tr>
              <th className="p-4">Insumo</th>
              <th className="p-4 text-center">Custo Base (100un)</th>
              {quantidades.map((q, i) => (
                <th key={i} className="p-4 text-center bg-zinc-800/20 italic">Qtd: {q}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {Object.entries(categorias).map(([cat, items]) => (
              <React.Fragment key={cat}>
                <tr className="bg-zinc-800/30">
                  <td colSpan={2 + quantidades.length} className="px-4 py-1 text-[9px] font-bold text-blue-500/70 uppercase">{cat}</td>
                </tr>
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-800/10 transition">
                    <td className="p-4 font-medium text-zinc-300">{item.nome}</td>
                    <td className="p-4 w-40">
                      <input 
                        type="number" 
                        step="0.01"
                        value={custos[item.id]} 
                        onChange={(e) => setCustos({...custos, [item.id]: Number(e.target.value)})}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-right tabular-nums"
                      />
                    </td>
                    {quantidades.map((q, i) => (
                      <td key={i} className="p-4 text-center text-zinc-500 tabular-nums border-l border-zinc-800/20">
                        {((custos[item.id] / 100) * q).toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot className="bg-zinc-900 font-bold">
            <tr className="text-blue-400">
              <td colSpan={2} className="p-4 text-right uppercase text-[10px]">Preço Sugerido (Venda)</td>
              {totaisCusto.map((t, i) => (
                <td key={i} className="p-4 text-center text-lg border-l border-zinc-800/50">
                  {((t * (1 + markup/100))).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
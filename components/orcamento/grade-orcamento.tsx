'use client';

import React, { useState, useMemo, useEffect } from 'react';

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
  // Estados internos
  const [quantidades, setQuantidades] = useState<number[]>(quantidadesPadrao);
  const [markup, setMarkup] = useState<number>(markupInicial);
  const [custos, setCustos] = useState<Record<string, number>>({});

  /**
   * ESTE É O AJUSTE PRINCIPAL:
   * Sempre que as props vindas do servidor mudarem (ao trocar de versão),
   * o useEffect reinicia os estados internos do componente.
   */
  useEffect(() => {
    const init: Record<string, number> = {};
    insumosIniciais.forEach((i) => {
      init[i.id] = i.custo_unitario || 0;
    });
    
    setCustos(init);
    setQuantidades(quantidadesPadrao);
    setMarkup(markupInicial);
  }, [insumosIniciais, quantidadesPadrao, markupInicial]);

  // Agrupamento de categorias (memoizado para performance)
  const categorias = useMemo(() => {
    const groups: Record<string, Insumo[]> = {};
    insumosIniciais.forEach((i) => {
      const cat = i.categoria || 'Geral';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(i);
    });
    return groups;
  }, [insumosIniciais]);

  // Cálculos de totais (recalcula sempre que custos ou quantidades mudarem)
  const totaisCusto = useMemo(() => {
    return quantidades.map(q => 
      insumosIniciais.reduce((acc, insumo) => acc + ((custos[insumo.id] || 0) / 100) * q, 0)
    );
  }, [custos, quantidades, insumosIniciais]);

  // Prepara os dados para o envio do formulário (Action)
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
      {/* Campos ocultos para o FormData da Action */}
      <input type="hidden" name="valores" value={payloadValores} />
      <input type="hidden" name="markup" value={markup} />

      {/* Toolbar de Configurações */}
      <div className="flex justify-between items-center bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-4">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Markup (%)</label>
          <input 
            type="number" 
            value={markup} 
            onChange={(e) => setMarkup(Number(e.target.value))}
            className="bg-zinc-950 border border-zinc-700 rounded px-3 py-1 w-20 text-blue-400 font-bold outline-none focus:border-blue-500 transition"
          />
        </div>
        <button 
          type="button"
          onClick={() => setQuantidades([...quantidades, (quantidades[quantidades.length-1] || 0) + 500])}
          className="text-[10px] bg-blue-600/10 text-blue-500 border border-blue-500/20 px-4 py-2 rounded-lg font-bold hover:bg-blue-600/20 transition uppercase"
        >
          + Adicionar Coluna
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/50">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-zinc-900 text-zinc-500 uppercase text-[10px] font-bold">
            <tr>
              <th className="p-4 w-1/4">Insumo</th>
              <th className="p-4 text-center w-40">Custo Base (100un)</th>
              {quantidades.map((q, i) => (
                <th key={i} className="p-4 text-center bg-zinc-800/20">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[8px] opacity-50">Qtd Ref.</span>
                    <input 
                      type="number"
                      value={q}
                      onChange={(e) => {
                        const newQ = [...quantidades];
                        newQ[i] = Number(e.target.value);
                        setQuantidades(newQ);
                      }}
                      className="bg-transparent border-b border-zinc-700 w-16 text-center text-zinc-300 focus:border-blue-500 outline-none font-mono"
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {Object.entries(categorias).map(([cat, items]) => (
              <React.Fragment key={cat}>
                <tr className="bg-zinc-800/30">
                  <td colSpan={2 + quantidades.length} className="px-4 py-1.5 text-[9px] font-bold text-blue-400 uppercase tracking-widest border-y border-zinc-800">
                    {cat}
                  </td>
                </tr>
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-800/10 transition group">
                    <td className="p-4 text-zinc-300 group-hover:text-white font-medium">{item.nome}</td>
                    <td className="p-4">
                      <div className="relative flex items-center">
                        <span className="absolute left-2 text-zinc-600 text-[10px]">R$</span>
                        <input 
                          type="number" 
                          step="0.01"
                          value={custos[item.id] ?? 0} 
                          onChange={(e) => setCustos({...custos, [item.id]: Number(e.target.value)})}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 pl-7 text-right tabular-nums text-zinc-400 focus:text-blue-400 focus:border-blue-500/50 transition outline-none"
                        />
                      </div>
                    </td>
                    {quantidades.map((q, i) => (
                      <td key={i} className="p-4 text-center text-zinc-500 tabular-nums border-l border-zinc-800/30 font-mono">
                        {(( (custos[item.id] || 0) / 100) * q).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot className="bg-zinc-900/80 font-bold border-t border-zinc-700 sticky bottom-0">
            <tr>
              <td colSpan={2} className="p-4 text-right uppercase text-[10px] text-zinc-500 tracking-widest">Custo de Produção Total</td>
              {totaisCusto.map((t, i) => (
                <td key={i} className="p-4 text-center text-zinc-400 border-l border-zinc-800/30 font-mono">
                  {t.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              ))}
            </tr>
            <tr className="bg-blue-600/10">
              <td colSpan={2} className="p-4 text-right uppercase text-[10px] text-blue-500 tracking-widest">Preço Sugerido com Markup</td>
              {totaisCusto.map((t, i) => (
                <td key={i} className="p-4 text-center text-lg text-blue-400 border-l border-blue-500/10 font-mono">
                  {(t * (1 + markup/100)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
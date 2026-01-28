'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, X, ChevronDown, ChevronRight, Plus, Trash2, Search } from 'lucide-react';

interface Insumo {
  id: string;
  nome: string;
  categoria: string;
  custo_unitario: number;
}

interface TipoPapel {
  id: string;
  nome: string;
  f1: number; f2: number; f3: number; f4: number; f6: number; f8: number; f9: number;
}

interface GradeOrcamentoProps {
  insumosIniciais: Insumo[];
  quantidadesPadrao: number[];
  markupInicial: number;
  tiposPapel: TipoPapel[];
}

export function GradeOrcamento({ insumosIniciais, quantidadesPadrao, markupInicial, tiposPapel }: GradeOrcamentoProps) {
  const [quantidades, setQuantidades] = useState<number[]>(quantidadesPadrao);
  const [markup, setMarkup] = useState<number>(markupInicial);
  const [custos, setCustos] = useState<Record<string, number>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeInsumoId, setActiveInsumoId] = useState<string | null>(null);
  const [calcParams, setCalcParams] = useState({
    papelId: '',
    formato: 'f1' as keyof Omit<TipoPapel, 'id' | 'nome'>,
    quantidadeFolhas: 1
  });

  const [searchTerm, setSearchTerm] = useState('');

  const papeisFiltrados = useMemo(() => {
    if (searchTerm.length < 4) return [];
    return tiposPapel.filter(p =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, tiposPapel]);

  useEffect(() => {
    const initCustos: Record<string, number> = {};
    const initExpanded: Record<string, boolean> = {};
    const categoriasPrincipais = ['miolo', 'capa', 'guardas'];

    insumosIniciais.forEach((i) => {
      initCustos[i.id] = i.custo_unitario || 0;
      const cat = (i.categoria || 'outros').toLowerCase();
      if (!initExpanded.hasOwnProperty(cat)) {
        initExpanded[cat] = categoriasPrincipais.includes(cat);
      }
    });

    setCustos(initCustos);
    setExpandedCategories(initExpanded);
  }, [insumosIniciais]);

  // Dentro de grade-orcamento.tsx
  useEffect(() => {
    const valoresExport: { insumo_id: string; quantidade_referencia: number; valor_custo_unitario_base: number }[] = [];

    // CORRIGIDO: nome da variável para insumosIniciais
    insumosIniciais.forEach(insumo => {
      // Agora percorre TODAS as colunas de quantidades
      quantidades.forEach(qtd => {
        valoresExport.push({
          insumo_id: insumo.id,
          quantidade_referencia: qtd,
          valor_custo_unitario_base: custos[insumo.id] || 0
        });
      });
    });

    const hiddenInput = document.getElementById('grade-dados-input') as HTMLInputElement;
    if (hiddenInput) {
      hiddenInput.value = JSON.stringify({
        markup: markup,
        valores: valoresExport
      });
    }
  }, [insumosIniciais, quantidades, custos, markup]); // CORRIGIDO: dependências

  const adicionarColuna = () => {
    const ultimaQtd = quantidades[quantidades.length - 1] || 0;
    setQuantidades([...quantidades, ultimaQtd + 100]);
  };

  const removerColuna = (index: number) => {
    if (quantidades.length > 1) {
      setQuantidades(quantidades.filter((_, i) => i !== index));
    }
  };

  const alterarQuantidade = (index: number, valor: number) => {
    const novas = [...quantidades];
    novas[index] = valor;
    setQuantidades(novas);
  };

  const categoriasOrdenadas = useMemo(() => {
    const ordemCategorias = ['miolo', 'capa', 'guardas', 'bloco 1° via', 'bloco 2° via', 'bloco 3° via', 'papelão', 'outros', 'tercerizados'];
    const groups: Record<string, Insumo[]> = {};

    insumosIniciais.forEach((i) => {
      const cat = (i.categoria || 'outros').toLowerCase();
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(i);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => {
        const indexA = ordemCategorias.indexOf(a);
        const indexB = ordemCategorias.indexOf(b);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      })
      .map(([cat, items]) => {
        const itemsOrdenados = [...items].sort((a, b) => {
          const aIsPapel = a.nome.toLowerCase().includes('papel') && !a.nome.toLowerCase().includes('papelão');
          const bIsPapel = b.nome.toLowerCase().includes('papel') && !b.nome.toLowerCase().includes('papelão');
          if (aIsPapel && !bIsPapel) return -1;
          if (!aIsPapel && bIsPapel) return 1;
          return 0;
        });
        return [cat, itemsOrdenados] as [string, Insumo[]];
      });
  }, [insumosIniciais]);

  const aplicarCalculoPapel = () => {
    const papelSelecionado = tiposPapel.find(p => p.id === calcParams.papelId);
    if (papelSelecionado && activeInsumoId) {
      const valorUnitarioFormato = papelSelecionado[calcParams.formato] || 0;
      const custoTotalFinal = valorUnitarioFormato * calcParams.quantidadeFolhas;
      setCustos(prev => ({ ...prev, [activeInsumoId]: Number(custoTotalFinal.toFixed(4)) }));
      setIsModalOpen(false);
      setSearchTerm('');
    }
  };

  const totaisCusto = useMemo(() => {
    return quantidades.map(q =>
      insumosIniciais.reduce((acc, insumo) => acc + ((custos[insumo.id] || 0) / 100) * q, 0)
    );
  }, [custos, quantidades, insumosIniciais]);

  return (
    <div>
      {/* Campo Oculto para sincronizar com a Server Action */}
      <input
        type="hidden"
        name="grade_dados"
        id="grade-dados-input"
      />

      {/* TOOLBAR */}
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
          onClick={adicionarColuna}
          className="flex items-center gap-2 bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 px-4 py-2 rounded-lg text-xs font-bold transition uppercase tracking-tighter"
        >
          <Plus size={14} /> Adicionar Coluna
        </button>
      </div>

      {/* TABELA */}
      <div className="mt-8 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/50 shadow-xl">
        <table className="w-full text-left text-sm border-collapse min-w-[800px]">
          <thead className="bg-zinc-900 text-zinc-500 uppercase font-bold">
            <tr>
              <th className="p-4 w-1/4 border-b border-zinc-800 text-[10px]">Insumo</th>
              <th className="p-4 text-center w-40 border-b border-zinc-800 text-[10px]">Custo Base (100un)</th>
              {quantidades.map((q, i) => (
                <th key={i} className="p-4 text-center bg-zinc-800/10 border-b border-zinc-800 min-w-[130px]">
                  <div className="flex flex-col items-center justify-center group">
                    <input
                      type="number"
                      value={q}
                      onChange={(e) => alterarQuantidade(i, Number(e.target.value))}
                      className="bg-transparent border-none text-center text-blue-400 font-black text-lg w-full focus:ring-0 focus:outline-none p-0 leading-none"
                    />
                    <span className="text-[9px] text-zinc-500 mt-1 tracking-tighter">UNIDADES</span>
                    <button
                      type="button"
                      onClick={() => removerColuna(i)}
                      className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500 transition-all mt-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {categoriasOrdenadas.map(([cat, items]) => {
              const isExpanded = expandedCategories[cat];
              return (
                <React.Fragment key={cat}>
                  <tr onClick={() => setExpandedCategories(p => ({ ...p, [cat]: !isExpanded }))} className="bg-zinc-800/30 cursor-pointer hover:bg-zinc-800/50">
                    <td colSpan={2 + quantidades.length} className="px-4 py-2 border-y border-zinc-800">
                      <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />} {cat}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && items.map(item => {
                    const isPapel = item.nome.toLowerCase().includes('papel');
                    const isPapelao = item.categoria.toLowerCase() === 'papelão' || item.nome.toLowerCase().includes('papelão');
                    const showCalculator = isPapel && !isPapelao;
                    return (
                      <tr key={item.id} className="hover:bg-zinc-800/10 transition group">
                        <td className="p-4 text-zinc-300 font-medium">{item.nome}</td>
                        <td className="p-4">
                          <div className="relative flex items-center gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-2 top-1.5 text-zinc-600 text-[10px]">R$</span>
                              <input
                                type="number"
                                step="0.0001"
                                value={custos[item.id] ?? 0}
                                onChange={(e) => setCustos({ ...custos, [item.id]: Number(e.target.value) })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 pl-7 text-right tabular-nums text-zinc-400 focus:text-blue-400 outline-none"
                              />
                            </div>
                            {showCalculator && (
                              <button
                                type="button"
                                onClick={() => { setActiveInsumoId(item.id); setIsModalOpen(true); }}
                                className="p-2 bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 rounded-lg transition"
                              >
                                <Calculator size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                        {quantidades.map((q, i) => (
                          <td key={i} className="p-4 text-center text-zinc-500 tabular-nums border-l border-zinc-800/30 font-mono">
                            {(((custos[item.id] || 0) / 100) * q).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
          <tfoot className="bg-zinc-900/50 border-t-2 border-zinc-800">
            <tr className="bg-zinc-900/80">
              <td className="p-4 font-bold text-zinc-400 uppercase text-[10px]">Custo Total</td>
              <td className="p-4"></td>
              {totaisCusto.map((total, i) => (
                <td key={i} className="p-4 text-center text-zinc-300 font-mono font-bold border-l border-zinc-800/30">
                  {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              ))}
            </tr>
            <tr className="bg-blue-600/10">
              <td className="p-4 font-black text-blue-500 uppercase text-[10px]">Venda ({markup}%)</td>
              <td className="p-4"></td>
              {totaisCusto.map((total, i) => (
                <td key={i} className="p-4 text-center text-blue-400 font-mono font-black text-lg border-l border-zinc-800/30">
                  {(total * (1 + markup / 100)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* MODAL DA CALCULADORA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Calculator className="text-blue-500" size={20} />
                Calculadora de Folhas
              </h3>
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setSearchTerm(''); }}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Buscar Insumo de Papel</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-zinc-500" size={16} />
                  <input
                    type="text"
                    placeholder="Digite pelo menos 4 letras..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 pl-10 text-zinc-300 outline-none focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  />
                </div>

                <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 custom-scrollbar">
                  {searchTerm.length >= 4 ? (
                    papeisFiltrados.length > 0 ? (
                      papeisFiltrados.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setCalcParams({ ...calcParams, papelId: p.id });
                            setSearchTerm(p.nome);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-zinc-900 last:border-0
                            ${calcParams.papelId === p.id
                              ? 'bg-blue-600/20 text-blue-400 font-bold'
                              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                            }`}
                        >
                          {p.nome}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-zinc-600 uppercase">Nenhum papel encontrado</div>
                    )
                  ) : (
                    <div className="p-4 text-center text-xs text-zinc-600 uppercase">Digite para pesquisar</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Formato</label>
                  <select
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-zinc-300 outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    value={calcParams.formato}
                    onChange={(e) => setCalcParams({ ...calcParams, formato: e.target.value as keyof Omit<TipoPapel, 'id' | 'nome'> })}
                  >
                    {['f1', 'f2', 'f3', 'f4', 'f6', 'f8', 'f9'].map(f => (
                      <option key={f} value={f}>{f.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Qtd. de Folhas</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-zinc-300 outline-none focus:border-blue-500"
                    value={calcParams.quantidadeFolhas}
                    onChange={(e) => setCalcParams({ ...calcParams, quantidadeFolhas: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="bg-blue-600/5 border border-blue-500/20 p-4 rounded-xl mt-4 space-y-2">
                <div className="flex justify-between text-[11px] text-zinc-400 italic">
                  <span>Papel selecionado:</span>
                  <span className="text-zinc-300">{tiposPapel.find(p => p.id === calcParams.papelId)?.nome || 'Nenhum'}</span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Preço Unitário ({calcParams.formato.toUpperCase()}):</span>
                  <span>
                    R$ {tiposPapel.find(p => p.id === calcParams.papelId)?.[calcParams.formato]?.toFixed(4) || '0,0000'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white border-t border-zinc-800 pt-2">
                  <span>Custo Total:</span>
                  <span className="text-blue-400">
                    {((tiposPapel.find(p => p.id === calcParams.papelId)?.[calcParams.formato] || 0) * calcParams.quantidadeFolhas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={aplicarCalculoPapel}
                disabled={!calcParams.papelId}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] mt-2"
              >
                Aplicar na Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
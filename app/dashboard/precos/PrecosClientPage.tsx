'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Database, Settings2, Paperclip, Scissors, FileText } from 'lucide-react';
import { atualizarPrecosInsumos } from './actions/atualizarPrecos';

export default function PrecosClientPage({ data }: { data: any[] }) {
    // Inicializa o estado com os dados vindos do servidor
    const [editados, setEditados] = useState<any[]>(data);
    const [isSaving, setIsSaving] = useState(false);

    // Sincroniza o estado se os dados do servidor mudarem (refresh da página)
    useEffect(() => {
        setEditados(data);
        console.log('Dados atualizados no cliente:', data);
    }, [data]);

    const handleChange = (id: string, campo: string, valor: number) => {
        setEditados(prev => prev.map(item => 
            item.id === id ? { ...item, [campo]: valor } : item
        ));
    };

    const handleSalvar = async () => {
        setIsSaving(true);
        try {
            await atualizarPrecosInsumos(editados);
            alert("Todos os preços foram atualizados com sucesso!");
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar as alterações.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-24">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Gestão de Preços</h1>
                    <p className="text-zinc-500 text-sm mt-1">Atualize os custos base que alimentam os orçamentos.</p>
                </div>
                <button 
                    onClick={handleSalvar}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl flex gap-2 items-center disabled:opacity-50 transition-all font-bold shadow-lg shadow-blue-900/20"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {isSaving ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
                </button>
            </header>

            <div className="grid gap-12">
                
                {/* TABELA DE PAPÉIS */}
                <section>
                    <div className="flex items-center gap-2 mb-4 text-yellow-500 text-xs font-bold uppercase tracking-widest">
                        <FileText size={16} /> Tipos de Papel (Preço por Formato)
                    </div>
                    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-x-auto">
                        {/* min-w garante que a tabela não esprema os inputs */}
                        <table className="w-full text-left text-sm min-w-[800px]">
                            <thead>
                                <tr className="text-zinc-500 text-[10px] uppercase bg-zinc-950 border-b border-zinc-800">
                                    <th className="p-4 sticky left-0 bg-zinc-950">Papel</th>
                                    <th className="p-4 text-center">F1</th>
                                    <th className="p-4 text-center">F2</th>
                                    <th className="p-4 text-center">F3</th>
                                    <th className="p-4 text-center">F4</th>
                                    <th className="p-4 text-center">F6</th>
                                    <th className="p-4 text-center">F8</th>
                                    <th className="p-4 text-center">F9</th>
                                </tr>
                            </thead>
                            <tbody>
                                {editados.filter(i => i.tipo === 'papel').map(item => (
                                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-white font-medium sticky left-0 bg-zinc-900 shadow-xl">{item.nome}</td>
                                        {['f1', 'f2', 'f3', 'f4', 'f6', 'f8', 'f9'].map(f => (
                                            <td key={f} className="p-2 text-center">
                                                <input 
                                                    type="number" 
                                                    step="0.0001"
                                                    value={item[f] || 0}
                                                    onChange={e => handleChange(item.id, f, Number(e.target.value))}
                                                    className="bg-black border border-zinc-700 p-2 rounded w-20 text-yellow-500 text-center text-xs focus:border-yellow-500 outline-none transition-all"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 2. WIRE-O */}
                <section>
                    <div className="flex items-center gap-2 mb-4 text-blue-400">
                        <Database size={18} />
                        <h2 className="font-bold uppercase text-xs tracking-widest">Tabela de Wire-o</h2>
                    </div>
                    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-zinc-500 text-[10px] uppercase bg-zinc-950/50 border-b border-zinc-800">
                                    <th className="p-4">Diâmetro</th>
                                    <th className="p-4 text-center">Preço Caixa Base</th>
                                    <th className="p-4 text-center">Preço Caixa Especial</th>
                                </tr>
                            </thead>
                            <tbody>
                                {editados.filter(i => i.tipo === 'wireo').map(item => (
                                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-white font-medium">{item.diametro} <span className="text-zinc-500 ml-2">({item.passo})</span></td>
                                        <td className="p-4 text-center">
                                            <input 
                                                type="number"
                                                value={item.preco_caixa_base}
                                                onChange={e => handleChange(item.id, 'preco_caixa_base', Number(e.target.value))}
                                                className="bg-black border border-zinc-700 p-2 rounded-lg w-32 text-blue-400 text-center focus:border-blue-500 outline-none"
                                            />
                                        </td>
                                        <td className="p-4 text-center">
                                            <input 
                                                type="number"
                                                value={item.preco_caixa_especial}
                                                onChange={e => handleChange(item.id, 'preco_caixa_especial', Number(e.target.value))}
                                                className="bg-black border border-zinc-700 p-2 rounded-lg w-32 text-purple-400 text-center focus:border-purple-500 outline-none"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 3. ESPIRAIS */}
                <section>
                    <div className="flex items-center gap-2 mb-4 text-orange-400">
                        <Paperclip size={18} />
                        <h2 className="font-bold uppercase text-xs tracking-widest">Tabela de Espirais</h2>
                    </div>
                    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-zinc-500 text-[10px] uppercase bg-zinc-950/50 border-b border-zinc-800">
                                    <th className="p-4">Tamanho (mm)</th>
                                    <th className="p-4 text-right">Preço por Cento (100un)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {editados.filter(i => i.tipo === 'espiral').map(item => (
                                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-white font-medium">{item.tamanho_mm}</td>
                                        <td className="p-4 text-right">
                                            <input 
                                                type="number"
                                                value={item.preco_cento}
                                                onChange={e => handleChange(item.id, 'preco_cento', Number(e.target.value))}
                                                className="bg-black border border-zinc-700 p-2 rounded-lg w-32 text-orange-400 text-right focus:border-orange-500 outline-none"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 4. ACESSÓRIOS */}
                <section>
                    <div className="flex items-center gap-2 mb-4 text-pink-400">
                        <Scissors size={18} />
                        <h2 className="font-bold uppercase text-xs tracking-widest">Acessórios Extras</h2>
                    </div>
                    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-zinc-500 text-[10px] uppercase bg-zinc-950/50 border-b border-zinc-800">
                                    <th className="p-4">Nome do Acessório</th>
                                    <th className="p-4 text-right">Custo Unitário (R$)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {editados.filter(i => i.tipo === 'acessorio').map(item => (
                                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-white font-medium">{item.nome}</td>
                                        <td className="p-4 text-right">
                                            <input 
                                                type="number" step="0.01"
                                                value={item.custo_unitario}
                                                onChange={e => handleChange(item.id, 'custo_unitario', Number(e.target.value))}
                                                className="bg-black border border-zinc-700 p-2 rounded-lg w-32 text-pink-400 text-right focus:border-pink-500 outline-none"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
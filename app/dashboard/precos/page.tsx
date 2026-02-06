// app/dashboard/precos/page.tsx
import { createClient } from "@/lib/supabase/server";
import PrecosClientPage from "./PrecosClientPage";
import { DashboardHeader } from "@/components/dashboard-header";

export default async function PrecosPage() {
  const supabase = await createClient();

  const [
    { data: papeis },
    { data: wireo },
    { data: espirais },
    { data: acessorios }
  ] = await Promise.all([
    supabase.from('tipos_papel').select('*').order('nome'),
    supabase.from('insumos_wireo').select('*').order('diametro'),
    supabase.from('insumos_espiral').select('*').order('tamanho_mm'),
    supabase.from('insumos_acessorios').select('*').order('nome')
  ]);

  const dataConsolidada = [
    ...(papeis?.map(item => ({ ...item, tipo: 'papel' })) || []),
    ...(wireo?.map(item => ({ ...item, tipo: 'wireo' })) || []),
    ...(espirais?.map(item => ({ ...item, tipo: 'espiral' })) || []),
    ...(acessorios?.map(item => ({ ...item, tipo: 'acessorio' })) || []),
  ];

  return ( 
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8">
      <DashboardHeader />

      {/* AVISO PARA TELAS MENORES QUE 1000px (Aproximadamente o breakpoint 'lg') */}
      {/* Usamos max-[1000px] para esconder acima de 1000px e flex abaixo disso */}
      <div className="hidden max-[1000px]:flex flex-col items-center justify-center text-center py-20 px-6">
        <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 max-w-md">
          <div className="bg-yellow-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Resolução Insuficiente</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            A <strong>Tabela de Preços</strong> contém muitas colunas de formatos (F1 a F9) e detalhes técnicos que não podem ser exibidos corretamente em telas menores que 1000px.
            <br /><br />
            Para garantir a precisão na edição dos valores, utilize um monitor <strong>Desktop</strong>.
          </p>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL: Visível apenas acima de 1000px */}
      <main className="hidden min-[1001px]:block max-w-7xl mx-auto px-6">
        <PrecosClientPage data={dataConsolidada} />
      </main>
    </div>
  );
}
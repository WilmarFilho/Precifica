export const dynamic = "force-dynamic";

import { DashboardHeader } from "@/components/dashboard-header";

export default function DashboardOrcamentosPage() {
  return (
    <div className="max-w-7xl mx-auto py-8">
      <DashboardHeader />
      <div className="flex items-center gap-4 mb-6 w-full">
        <button className="bg-primary text-black font-semibold px-5 py-2 rounded-lg shadow hover:bg-primary/90 transition">Novo Orçamento</button>
        <input
          type="text"
          placeholder="Buscar orçamentos..."
          className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5].map((id) => (
          <div key={id} className="bg-card border rounded-xl p-6 shadow flex flex-col gap-2">
            <div className="font-bold text-lg text-foreground">Orçamento #{id}</div>
            <div className="text-muted-foreground">Cliente: Fulano {id}</div>
            <div className="text-muted-foreground">Valor: R$ {id * 1000},00</div>
            <div className="text-xs text-muted-foreground">Criado em: 25/01/2026</div>
            <button className="mt-2 self-end px-4 py-1 rounded bg-primary text-black font-medium hover:bg-primary/90 transition">Ver detalhes</button>
          </div>
        ))}
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";


import { DashboardHeader } from "@/components/dashboard-header";

// Mock de clientes
const clientes = [
  { id: 1, nome: "Fulano 1", created_at: "2026-01-20" },
  { id: 2, nome: "Fulano 2", created_at: "2026-01-21" },
  { id: 3, nome: "Fulano 3", created_at: "2026-01-22" },
  { id: 4, nome: "Fulano 4", created_at: "2026-01-23" },
  { id: 5, nome: "Fulano 5", created_at: "2026-01-24" },
];

export default function ClientesPage() {
  return (
    <div className="max-w-7xl mx-auto py-8">
      <DashboardHeader />
      <div className="flex items-center gap-4 mb-6 w-full">
        <button className="bg-primary text-black font-semibold px-5 py-2 rounded-lg shadow hover:bg-primary/90 transition">Novo Cliente</button>
        <input
          type="text"
          placeholder="Buscar clientes..."
          className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientes.map((cliente) => (
          <div key={cliente.id} className="bg-card border rounded-xl p-6 shadow flex flex-col gap-2">
            <div className="font-bold text-lg text-foreground">{cliente.nome}</div>
            <div className="text-muted-foreground">ID: {cliente.id}</div>
            <div className="text-xs text-muted-foreground">Criado em: {cliente.created_at}</div>
            <button className="mt-2 self-end px-4 py-1 rounded bg-primary text-black font-medium hover:bg-primary/90 transition">Ver detalhes</button>
          </div>
        ))}
      </div>
    </div>
  );
}

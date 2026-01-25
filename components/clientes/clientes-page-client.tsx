"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { NovoClienteModal } from "./novo-cliente-modal";

type Cliente = {
  id: string;
  nome: string;
  created_at: string | null;
};

export function ClientesPageClient({ clientes }: { clientes: Cliente[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [busca, setBusca] = useState("");
  // Filtro local (pode ser substituído por busca server action futuramente)
  const clientesFiltrados = clientes.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Buscar cliente..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="max-w-xs"
        />
        <Button variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div className="border rounded-md p-4 bg-card min-h-[120px]">
        {clientesFiltrados.length === 0 ? (
          <span className="text-muted-foreground">Nenhum cliente cadastrado.</span>
        ) : (
          <ul className="divide-y">
            {clientesFiltrados.map(cliente => (
              <li key={cliente.id} className="py-2 flex items-center justify-between">
                <span>{cliente.nome}</span>
                <span className="text-xs text-muted-foreground">{cliente.created_at ? new Date(cliente.created_at).toLocaleDateString() : ""}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <NovoClienteModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
import { listarClientes } from "@/app/dashboard/clientes/actions/listarClientes";
import { ClientesPageClient } from "./clientes-page-client";

export async function ClientesPage() {
  const clientes = await listarClientes("");
  return <ClientesPageClient clientes={clientes} />;
}

export const dynamic = "force-dynamic";

export default function DashboardOrcamentosPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Orçamentos</h1>
      <div className="border rounded-md p-4 bg-card min-h-[120px] text-muted-foreground">
        Nenhum orçamento cadastrado ainda.
      </div>
    </div>
  );
}
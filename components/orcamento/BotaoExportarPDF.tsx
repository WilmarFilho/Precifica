'use client';

import { FileDown } from 'lucide-react';

interface BotaoExportarPDFProps {
  projeto?: string;
  cliente?: string;
  usuario?: string;
  versao?: string | number;
}

export function BotaoExportarPDF({ projeto, cliente, usuario, versao }: BotaoExportarPDFProps) {
  const handleGerarPDF = () => {
    const event = new CustomEvent('gerar-pdf-orcamento', {
      detail: {
        projeto: projeto || "Sem título",
        cliente: cliente || "Não informado",
        usuario: usuario || "Sistema",
        versao: versao || 1
      }
    });
    window.dispatchEvent(event);
  };

  return (
    <button
      type="button"
      onClick={handleGerarPDF}
      className="flex items-center gap-2 px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-sm border border-zinc-700 transition-all active:scale-95"
    >
      <FileDown size={18} className="text-blue-400" />
      Gerar PDF
    </button>
  );
}
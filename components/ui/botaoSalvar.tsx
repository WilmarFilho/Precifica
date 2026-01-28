'use client';
import { useFormStatus } from 'react-dom';
import { Loader2, Plus } from 'lucide-react';

export function BotaoSalvar() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full md:w-auto px-8 py-5 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition text-xs uppercase flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Plus className="w-5 h-5" />
      )}
      {pending ? 'Salvando...' : 'Salvar Versão'}
    </button>
  );
}
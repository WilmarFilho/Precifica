'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function NovoClienteModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('clientes')
      .insert([{ nome, user_id: user?.id }]);

    if (!error) {
      setNome('');
      setIsOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full md:w-auto whitespace-nowrap bg-blue-600 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition uppercase text-xs flex items-center justify-center gap-2"
      >
        <UserPlus size={16} />
        Novo Cliente
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Novo Cliente</h2>
                  <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500 mb-2 block tracking-widest">
                      Nome Completo ou Razão Social
                    </label>
                    <input 
                      autoFocus
                      required
                      type="text" 
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Gráfica Premium LTDA"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition placeholder:text-zinc-700"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 px-6 py-4 rounded-2xl bg-zinc-800 text-white font-bold text-xs uppercase hover:bg-zinc-700 transition"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex-[2] px-6 py-4 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" size={16} /> : "Cadastrar Cliente"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
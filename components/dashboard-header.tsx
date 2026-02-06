'use client';

import { useState } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/buttons/logout-button";
import { Menu, X } from "lucide-react";

export function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navLinks = [
      { href: "/dashboard/orcamentos", label: "Orçamentos" },
      { href: "/dashboard/clientes", label: "Clientes" },
      { href: "/dashboard/precos", label: "Tabela de Preços" }, // Novo link
  ];

  return (
    // Removido max-w-7xl e mx-auto daqui, pois o pai já controla isso
    <header className="w-full relative z-50 mb-8">
      <div 
        className={`w-full flex items-center justify-between py-4 px-6 md:px-10 transition-all duration-300 ${
          isMenuOpen ? "rounded-t-3xl border-b-0" : "rounded-full"
        } border border-white/10 bg-white/5 backdrop-blur-lg shadow-md`}
        style={{ background: "rgba(255,255,255,0.07)" }}
      >
        <Link href="/dashboard/orcamentos" className="font-extrabold text-lg tracking-wide text-white uppercase shrink-0">
          Precifica
        </Link>

        <nav className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-white/80 hover:text-white font-medium transition text-sm uppercase tracking-wider"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <LogoutButton />
        </div>

        <button className="md:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute left-0 right-0 border border-t-0 border-white/10 bg-[#121214] backdrop-blur-xl rounded-b-3xl shadow-xl overflow-hidden">
          <nav className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/5 p-4 rounded-xl font-medium transition text-sm uppercase"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 mt-2 pt-4 pb-2 px-4">
              <LogoutButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
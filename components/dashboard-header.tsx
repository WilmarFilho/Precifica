import Link from "next/link";
import { LogoutButton } from "@/components/buttons/logout-button";

export function DashboardHeader() {
  return (
    <header
      className="w-full max-w-7xl mx-auto mt-6 mb-8 px-8 py-4 flex items-center justify-between rounded-full border border-white/10 bg-white/5 backdrop-blur-lg shadow-md"
      style={{ background: "rgba(255,255,255,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
    >
      {/* Logo */}
      <Link href="/dashboard/orcamentos" className="font-extrabold text-lg tracking-wide text-white drop-shadow-sm focus:outline-none uppercase">
        Precifica
      </Link>

      {/* Menu */}
      <nav className="flex gap-8">
        <Link href="/dashboard/orcamentos" className="text-white/80 hover:text-white font-medium transition">Orçamentos</Link>
        <Link href="/dashboard/clientes" className="text-white/80 hover:text-white font-medium transition">Clientes</Link>
      </nav>

      {/* Logout Button */}
      <div>
        <LogoutButton />
      </div>
    </header>
  );
}

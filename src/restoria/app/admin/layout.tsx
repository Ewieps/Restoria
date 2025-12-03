// app/admin/layout.tsx
import Link from 'next/link';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-slate-900 text-white p-4 space-y-4">
        <h1 className="text-xl font-bold">Restoria Admin</h1>
        <nav className="space-y-2">
          <Link href="/admin/menu" className="block hover:underline">
            Menu
          </Link>
          <Link href="/admin/orders" className="block hover:underline">
            Orders
          </Link>
          <Link href="/admin/reservations" className="block hover:underline">
            Reservations
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-slate-50">{children}</main>
    </div>
  );
}

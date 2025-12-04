import Link from 'next/link';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-72 bg-slate-900 text-white p-4 space-y-4">
        <h1 className="text-xl font-bold text-slate-800">Restoria Admin Panel

        </h1>
        <nav className="space-y-2">
          <Link href="/admin/" className="block hover:underline">
            Menu
          </Link>
          <Link href="/admin/orders" className="block hover:underline">
            Orders
          </Link>
          <Link href="/admin/reserve" className="block hover:underline">
            Reservations
          </Link>
          <Link href="/admin/staff" className="block hover:underline">
            Staff
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-slate-50">{children}</main>
    </div>
  );
}

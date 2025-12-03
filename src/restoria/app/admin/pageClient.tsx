// app/admin/AdminPageClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MenuConfiguration from './menu/MenuConfig';

type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  createdAt: string; 
};

export default function AdminPageClient() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    setIsAuthenticated(true);

    // fetch menu items via API
    async function loadItems() {
      try {
        const res = await fetch('/api/menu-items', {
          headers: {
            'Content-Type': 'application/json',
            // add Authorization later if you protect this endpoint
            // Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to load menu items');
        }

        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, [router]);

  function logoutHandler() {
    localStorage.removeItem('token');
    router.push('/admin/login');
  }

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return <div className="p-6">Loading menu items...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">Admin - Menu Management</h1>
          <button
            onClick={logoutHandler}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl py-8 space-y-6 px-4">
        <MenuConfiguration />

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Menu Items</h2>
          <span className="text-sm text-slate-900">
            Total items: {items.length}
          </span>
        </div>

        <table className="min-w-full border border-slate-200 bg-white text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="border-b px-3 py-2 text-left">ID</th>
              <th className="border-b px-3 py-2 text-left">Name</th>
              <th className="border-b px-3 py-2 text-left">Category</th>
              <th className="border-b px-3 py-2 text-right">Price</th>
              <th className="border-b px-3 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="border-b px-3 py-2">{item.id}</td>
                <td className="border-b px-3 py-2">{item.name}</td>
                <td className="border-b px-3 py-2">
                  {item.category ?? '-'}
                </td>
                <td className="border-b px-3 py-2 text-right">
                  {item.price.toLocaleString('id-ID')}
                </td>
                <td className="border-b px-3 py-2 text-sm text-slate-500">
                  {new Date(item.createdAt)
                    .toISOString()
                    .slice(0, 16)
                    .replace('T', ' ')}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-slate-900"
                >
                  No menu items yet. Create one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

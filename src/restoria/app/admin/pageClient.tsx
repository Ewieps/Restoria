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
  image: string | null;
  createdAt: string;
};

export default function AdminPageClient() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    setIsAuthenticated(true);

    async function loadItems() {
      try {
        const res = await fetch('/api/menu-items', {
          headers: {
            'Content-Type': 'application/json',
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

  async function refreshItems() {
    setEditingItem(null); // Clear edit mode after success
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/menu-items', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to reload menu');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(item: MenuItem) {
    setEditingItem(item);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingItem(null);
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/menu-items/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!res.ok) throw new Error('Failed to delete');
      
      await refreshItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
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
          <h1 className="text-xl font-bold">Admin – Menu Management</h1>
          <button
            onClick={logoutHandler}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        {/* Show edit indicator */}
        {editingItem && (
          <div className="flex items-center justify-between rounded-md bg-blue-50 px-4 py-3">
            <p className="text-sm font-medium text-blue-900">
              Editing: {editingItem.name}
            </p>
            <button
              onClick={handleCancelEdit}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Cancel Edit
            </button>
          </div>
        )}

        <MenuConfiguration 
          editItem={editingItem} 
          onSuccess={refreshItems} 
        />

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
              <th className="border-b px-3 py-2 text-left">Actions</th>
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
                <td className="border-b px-3 py-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="mr-3 text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
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
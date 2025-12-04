'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type OrderRow = {
  id: number;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
};

type JwtPayload = {
  adminId: number;
  role: string;
  exp?: number;
};

const ORDER_STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  preparing: 'bg-blue-100 text-blue-800 border-blue-300',
  ready: 'bg-green-100 text-green-800 border-green-300',
  completed: 'bg-gray-100 text-gray-800 border-gray-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

function parseJwt(token: string): JwtPayload | null {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export default function OrdersPageClient() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const payload = parseJwt(token);
    // who can see orders
    if (!payload || !['mainadmin', 'store-manager', 'cashier'].includes(payload.role)) {
      router.push('/admin/login');
      return;
    }

    setCheckingAuth(false);
    loadOrders();
  }, [router]);

  async function loadOrders() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load orders');
      }
      const data = await res.json();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Error loading orders');
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeStatus(id: number, newStatus: string) {
    try {
      setUpdatingOrderId(id);
      setError(null);
      
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update status');
      }

      await res.json();
      await loadOrders();
    } catch (err: any) {
      setError(err.message ?? 'Error updating status');
    } finally {
      setUpdatingOrderId(null);
    }
  }

  function logoutHandler() {
    localStorage.removeItem('token');
    router.push('/admin/login');
  }

  if (checkingAuth) {
    return <div className="p-6">Checking admin access…</div>;
  }

  if (loading) {
    return <div className="p-6">Loading orders…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">Admin – Orders</h1>
          <button
            onClick={logoutHandler}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        {error && (
          <div className="rounded-md bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Orders</h2>
          <span className="text-sm text-slate-900">
            Total orders: {orders.length}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="border-b px-4 py-3 text-left font-medium">ID</th>
                <th className="border-b px-4 py-3 text-left font-medium">Customer</th>
                <th className="border-b px-4 py-3 text-right font-medium">Total</th>
                <th className="border-b px-4 py-3 text-left font-medium">Status</th>
                <th className="border-b px-4 py-3 text-left font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No orders yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="border-b px-4 py-3">{o.id}</td>
                    <td className="border-b px-4 py-3 font-medium">{o.customerName}</td>
                    <td className="border-b px-4 py-3 text-right">
                      Rp {o.total.toLocaleString('id-ID')}
                    </td>
                    <td className="border-b px-4 py-3">
                      <select
                        className={`rounded border px-3 py-1.5 text-xs font-medium ${
                          STATUS_COLORS[o.status] || 'bg-gray-100'
                        } ${updatingOrderId === o.id ? 'opacity-50' : ''}`}
                        value={o.status}
                        onChange={(e) => handleChangeStatus(o.id, e.target.value)}
                        disabled={updatingOrderId === o.id}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                      {updatingOrderId === o.id && (
                        <span className="ml-2 text-xs text-slate-500">Updating...</span>
                      )}
                    </td>
                    <td className="border-b px-4 py-3 text-slate-500">
                      {new Date(o.createdAt)
                        .toISOString()
                        .slice(0, 16)
                        .replace('T', ' ')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
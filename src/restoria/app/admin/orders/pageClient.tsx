'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type MenuItem = {
  id: number;
  name: string;
  price: number;
  description?: string | null;
  category?: string | null;
  image?: string | null;
};

type OrderItem = {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  menuItem: MenuItem;
};

type OrderDetail = {
  id: number;
  customerName: string;
  tableNumber: number | null;
  contact: string | null;
  notes?: string | null;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

type JwtPayload = {
  adminId: number;
  role: string;
  exp?: number;
};

const ORDER_STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  preparing: 'bg-blue-100 text-blue-800 border-b text-slate-600lue-300',
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
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const payload = parseJwt(token);
    if (!payload || !['mainadmin', 'storemanager', 'cashier'].includes(payload.role)) {
      router.push('/admin/login');
      return;
    }

    setCheckingAuth(false);
    loadOrders();
  }, [router]);

  async function loadOrders() {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || data?.message || 'Failed to load orders');
      }

      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeStatus(id: number, newStatus: string) {
    setError(null);
    
    try {
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
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || data?.message || 'Failed to update status');
      }

      await loadOrders();
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.message || 'Error updating status');
    }
  }

  async function handleDeleteOrder(id: number) {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || data?.message || 'Failed to delete order');
      }

      await loadOrders();
    } catch (err: any) {
      console.error('Error deleting order:', err);
      setError(err.message || 'Error deleting order');
    }
  }

  function toggleExpand(orderId: number) {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  }

  function logoutHandler() {
    localStorage.removeItem('token');
    router.push('/admin/login');
  }

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Checking admin access…</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading orders…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-slate-800">Admin – Orders</h1>
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
          <h2 className="text-2xl font-semibold text-slate-700">Orders</h2>
          <span className="text-sm text-slate-900">
            Total orders: {orders.length}
          </span>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-slate-500">
              No orders yet.
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <svg
                        className={`h-5 w-5 transition-transform ${
                          expandedOrderId === order.id ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                      <div>
                        <div className="text-xs text-slate-500">Order ID</div>
                        <div className="font-semibold text-slate-700">#{order.id}</div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Customer</div>
                        <div className="font-medium">{order.customerName}</div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Total</div>
                        <div className="font-semibold text-slate-700 text-emerald-600">
                          Rp {order.total.toLocaleString('id-ID')}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500 mb-1">Status</div>
                        <select
                          className={`rounded border px-3 py-1.5 text-xs font-medium ${
                            STATUS_COLORS[order.status] || 'bg-gray-100'
                          }`}
                          value={order.status}
                          onChange={(e) => handleChangeStatus(order.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Created</div>
                        <div className="text-sm text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString('id-ID')}
                          <br />
                          {new Date(order.createdAt).toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteOrder(order.id);
                      }}
                      className="rounded bg-red-500 px-3 py-2 text-xs text-white hover:bg-red-600 transition-colors"
                      title="Delete order"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {expandedOrderId === order.id && (
                  <div className="border-t border-slate-200 bg-slate-50 p-4">
                    <div className="grid md:grid-cols-2 gap-6">
          
                      <div>
                        <h3 className="font-semibold text-slate-700 text-slate-900 mb-3">Customer Information</h3>
                        <div className="space-y-2 text-sm">
                          {order.tableNumber && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Table:</span>
                              <span className="font-medium">{order.tableNumber}</span>
                            </div>
                          )}
                          {order.contact && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Contact:</span>
                              <span className="font-medium">{order.contact}</span>
                            </div>
                          )}
                          {order.notes && (
                            <div>
                              <span className="text-slate-600">Notes:</span>
                              <p className="font-medium mt-1">{order.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

            
                      <div>
                        <h3 className="font-semibold text-slate-700 text-slate-900 mb-3">Order Items</h3>
                        <div className="space-y-2">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between items-center text-sm bg-white rounded p-2"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">{item.menuItem.name}</div>
                                  <div className="text-xs text-slate-600">
                                    Rp {item.menuItem.price.toLocaleString('id-ID')} × {item.quantity}
                                  </div>
                                </div>
                                <div className="font-semibold text-slate-700 text-slate-900">
                                  Rp {(item.menuItem.price * item.quantity).toLocaleString('id-ID')}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-500">No items</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
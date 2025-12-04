'use client';

import { useState } from 'react';

type OrderItem = {
  id: number;
  quantity: number;
  menuItem: { name: string; price: number };
};

type Order = {
  id: number;
  customerName: string;
  contact: string | null;
  tableNumber: number | null;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

type Reservation = {
  id: number;
  name: string;
  contact: string;
  date: string;
  guests: number;
  note?: string | null;
  status: string;
};

export default function OrdersPage() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const q = encodeURIComponent(phone.trim());

      const [ordersRes, reservationsRes] = await Promise.all([
        fetch(`/api/orders?contact=${q}`),
        fetch(`/api/reservations?contact=${q}`),
      ]);

      if (!ordersRes.ok || !reservationsRes.ok) {
        alert('Gagal mengambil data pesanan / reservasi');
        return;
      }

      const [ordersData, reservationsData] = await Promise.all([
        ordersRes.json(),
        reservationsRes.json(),
      ]);

      setOrders(ordersData);
      setReservations(reservationsData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-6 text-gray-900">
          Pesanan & Reservasi Saya
        </h1>

        <form onSubmit={handleSearch} className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Masukkan nomor WhatsApp / telepon yang digunakan saat memesan
          </label>
          <div className="flex gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 08123456789"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? 'Memuat...' : 'Cari'}
            </button>
          </div>
        </form>

        {searched && orders.length === 0 && reservations.length === 0 && !loading && (
          <p className="text-gray-600">
            Tidak ditemukan pesanan atau reservasi dengan nomor tersebut.
          </p>
        )}

        {orders.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Pesanan</h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-700">
                      Pesanan #{order.id} • Meja {order.tableNumber ?? '-'}
                    </span>
                    <span className="text-sm capitalize text-gray-600">
                      {order.status}
                    </span>
                  </div>
                  <ul className="text-sm text-gray-700 mb-2">
                    {order.items.map((it) => (
                      <li key={it.id}>
                        {it.quantity}× {it.menuItem.name}
                      </li>
                    ))}
                  </ul>
                  <div className="text-sm text-gray-600">
                    Total: Rp {order.total.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {reservations.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Reservasi</h2>
            <div className="space-y-4">
              {reservations.map((r) => (
                <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-700">
                      Reservasi #{r.id} • {r.guests} orang
                    </span>
                    <span className="text-sm capitalize text-gray-600">
                      {r.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    {new Date(r.date).toLocaleString('id-ID')}
                  </div>
                  {r.note && (
                    <p className="text-xs text-gray-800 mt-1">Catatan: {r.note}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

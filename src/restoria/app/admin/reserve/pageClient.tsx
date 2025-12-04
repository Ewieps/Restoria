'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Reservation = {
  id: number;
  name: string;
  contact: string;
  date: string;
  guests: number;
  note: string | null;
  status: string;
  createdAt: string;
};

export default function ReservationsPageClient() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    async function load() {
      try {
        const res = await fetch('/api/reservations');
        if (!res.ok) throw new Error('Failed to load reservations');
        const data = await res.json();
        setReservations(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load reservations');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  async function reloadReservations() {
    try {
      const res = await fetch('/api/reservations');
      if (!res.ok) throw new Error('Failed to load reservations');
      const data = await res.json();
      setReservations(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load reservations');
    }
  }

  async function handleChangeStatus(id: number) {
    const current = reservations.find((r) => r.id === id);
    if (!current) return;

    const newStatus = prompt(
      `Edit status for reservation #${id} (current: ${current.status})`,
      current.status
    );

    if (!newStatus || newStatus.trim() === current.status) return;

    setError(null);
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PUT', // or PATCH if you prefer
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || data?.message || 'Failed to update status');
      }

      await reloadReservations();
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.message || 'Error updating status');
    }
  }

  async function handleDeleteReservation(id: number) {
    if (!confirm(`Delete reservation #${id}? This cannot be undone.`)) return;

    setError(null);
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || data?.message || 'Failed to delete reservation');
      }

      setReservations((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      console.error('Error deleting reservation:', err);
      setError(err.message || 'Error deleting reservation');
    }
  }

  if (loading) return <div className="p-6">Loading reservations...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">Admin – Reservations</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        {error && (
          <div className="rounded-md bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <table className="min-w-full border border-slate-200 bg-white text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="border-b px-3 text-slate-700 py-2 text-left">ID</th>
              <th className="border-b px-3 text-slate-700 py-2 text-left">Name</th>
              <th className="border-b px-3 text-slate-700 py-2 text-left">Contact</th>
              <th className="border-b px-3 text-slate-700 py-2 text-left">Date</th>
              <th className="border-b px-3 text-slate-700 py-2 text-right">Guests</th>
              <th className="border-b px-3 text-slate-700 py-2 text-left">Status</th>
              <th className="border-b px-3 text-slate-700 py-2 text-left">Created</th>
              <th className="border-b px-3 text-slate-700 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="border-b px-3 text-slate-700 py-2">{r.id}</td>
                <td className="border-b px-3 text-slate-700 py-2">{r.name}</td>
                <td className="border-b px-3 text-slate-700 py-2">{r.contact}</td>
                <td className="border-b px-3 text-slate-700 py-2">
                  {new Date(r.date).toISOString().slice(0, 16).replace('T', ' ')}
                </td>
                <td className="border-b px-3 text-slate-700 py-2 text-right">{r.guests}</td>
                <td className="border-b px-3 text-slate-700 py-2">{r.status}</td>
                <td className="border-b px-3 text-slate-700 py-2 text-sm text-slate-500">
                  {new Date(r.createdAt).toISOString().slice(0, 16).replace('T', ' ')}
                </td>
                <td className="border-b px-3 text-slate-700 py-2 text-right space-x-2">
                  <button
                    onClick={() => handleChangeStatus(r.id)}
                    className="rounded bg-emerald-500 px-3 py-1 text-xs text-white hover:bg-emerald-600"
                  >
                    Edit status
                  </button>
                  <button
                    onClick={() => handleDeleteReservation(r.id)}
                    className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center text-slate-900">
                  No reservations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

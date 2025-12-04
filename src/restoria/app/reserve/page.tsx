'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReservationPage() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [date, setDate] = useState(''); 
  const [time, setTime] = useState(''); 
  const [guests, setGuests] = useState('2');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);

    if (!name.trim() || !contact.trim() || !date || !time || !guests) {
      alert('Mohon lengkapi semua field wajib');
      return;
    }

    const dateTimeLocal = `${date}T${time}:00`;
    const isoDate = new Date(dateTimeLocal).toISOString();

    setLoading(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          contact,
          date: isoDate,         
          guests: Number(guests),
          note,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error || 'Gagal membuat reservasi');
        return;
      }

      setSuccess('Reservasi berhasil dibuat! Kami akan segera mengkonfirmasi.');
      setName('');
      setContact('');
      setDate('');
      setTime('');
      setGuests('2');
      setNote('');
      router.push('/'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-6 text-gray-900">
          Buat Reservasi
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-md p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Nama lengkap"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kontak (WhatsApp / Telepon) *
            </label>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Waktu *
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Tamu *
            </label>
            <input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan (Opsional)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Permintaan khusus, misalnya kursi bayi, alergi, dll."
            />
          </div>

          {success && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold text-slate-700 hover:bg-emerald-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Mengirim...' : 'Kirim Reservasi'}
          </button>
        </form>
      </div>
    </div>
  );
}

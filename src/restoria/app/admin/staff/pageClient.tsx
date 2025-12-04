'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type AdminRow = {
  id: number;
  username: string;
  role: string;
  createdAt: string;
};

type JwtPayload = {
  adminId: number;
  role: string;
  exp?: number;
};

const STAFF_ROLES = ['storemanager', 'cashier', 'server'];

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

export default function StaffPageClient() {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('storemanager');
  const [error, setError] = useState<string | null>(null);


  const [currentAdminId, setCurrentAdminId] = useState<number | null>(null);

  async function loadAdmins() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/list', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Only main-admin can manage staff');
        setAdmins([]);
        return;
      }
      if (!res.ok) throw new Error('Failed to load staff');
      const data = await res.json();
      setAdmins(data);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Error loading staff');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const payload = parseJwt(token);
    if (!payload || payload.role !== 'mainadmin') {
      router.push('/admin/login');
      return;
    }

    setCurrentAdminId(payload.adminId);

    loadAdmins();
  }, [router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError('Username and password required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
          role,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to create staff');
      }
      setUsername('');
      setPassword('');
      setRole('storemanager');
      await loadAdmins();
    } catch (err: any) {
      setError(err.message ?? 'Error creating staff');
    }
  }

  async function handleDelete(id: number) {
    if (id === currentAdminId) return;

    if (!confirm('Delete this staff account?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete staff');
      }

      await res.json();
      await loadAdmins();
    } catch (err: any) {
      setError(err.message ?? 'Error deleting staff');
      console.error(err);
    }
  }

  async function handleChangeRole(id: number, newRole: string) {
    if (id === currentAdminId) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update role');
      }

      await res.json();
      await loadAdmins();
    } catch (err: any) {
      setError(err.message ?? 'Error updating role');
    }
  }

  if (loading) return <div className="p-6">Loading staff...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-slate-800">Admin – Staff Management</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <form
          onSubmit={handleCreate}
          className="flex flex-wrap items-end gap-3 rounded-md border border-slate-200 bg-white p-4"
        >
          <div className="min-w-[160px] flex-1">
            <label className="block text-xs font-medium text-slate-600">
              Username
            </label>
            <input
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="min-w-[160px] flex-1">
            <label className="block text-xs font-medium text-slate-600">
              Password
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="w-40">
            <label className="block text-xs font-medium text-slate-600">
              Role
            </label>
            <select
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="h-9 rounded bg-slate-900 px-4 text-sm font-medium text-white"
          >
            Add staff
          </button>

          {error && (
            <p className="mt-2 w-full text-sm text-red-600">{error}</p>
          )}
        </form>

        <table className="min-w-full border border-slate-200 bg-white text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="border-b text-slate-600 px-3 py-2 text-left">ID</th>
              <th className="border-b text-slate-600 px-3 py-2 text-left">Username</th>
              <th className="border-b text-slate-600 px-3 py-2 text-left">Role</th>
              <th className="border-b text-slate-600 px-3 py-2 text-left">Created</th>
              <th className="border-b text-slate-600 px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins
              .filter((a) => a.id !== currentAdminId) 
              .map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="border-b text-slate-600 px-3 py-2">{a.id}</td>
                  <td className="border-b text-slate-600 px-3 py-2">{a.username}</td>
                  <td className="border-b text-slate-600 px-3 py-2">
                    <select
                      className="rounded border px-2 py-1 text-xs"
                      value={a.role}
                      onChange={(e) => handleChangeRole(a.id, e.target.value)}
                    >
                      {STAFF_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border-b text-slate-600 px-3 py-2 text-sm text-slate-500">
                    {new Date(a.createdAt)
                      .toISOString()
                      .slice(0, 16)
                      .replace('T', ' ')}
                  </td>
                  <td className="border-b text-slate-600 px-3 py-2">
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

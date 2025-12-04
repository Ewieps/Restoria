'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUploadThing } from '@/lib/uploadthing';
import type { OurFileRouter } from '@/app/api/uploadthing/core';


type Props = {
  onSuccess?: () => void;
  editItem?: {
    id: number;
    name: string;
    price: number;
    category: string | null;
    image: string | null;
    description: string | null;
  } | null;
};

type JwtPayload = {
  adminId: number;
  role: string;
  exp?: number;
};

const CATEGORIES = ['main', 'side', 'drink', 'dessert'];

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

export default function MenuConfiguration({ onSuccess, editItem }: Props) {
  const router = useRouter();
  const { startUpload } = useUploadThing("imageUploader", {
    headers: () => {
      const token = localStorage.getItem('token');
      return {
        Authorization: token ? `Bearer ${token}` : '',
      };
    },
  });

  const [name, setName] = useState('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // optional: store role for UI decisions
  const [role, setRole] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Populate form when editing
  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setPrice(editItem.price.toString());
      setCategory(editItem.category || '');
      setImage(editItem.image || '');
      setDescription(editItem.description || '');
    }
  }, [editItem]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const payload = parseJwt(token);
    if (!payload || !['mainadmin', 'store-manager'].includes(payload.role)) {
      router.push('/admin/login');
      return;
    }

    setRole(payload.role);
    setCheckingAuth(false);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (price === '' || Number(price) <= 0) {
      setError('Price must be a positive number');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');

      let imageUrl = image;

      // Upload image if a file is selected
      if (imageFile) {
        try {
          const uploadResult = await startUpload([imageFile]);
          
          if (!uploadResult || uploadResult.length === 0) {
            throw new Error('Upload returned no results');
          }
          
          imageUrl = uploadResult[0].url;
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message || 'Unknown error'}`);
        }
      }

      const url = editItem 
        ? `/api/menu-items/${editItem.id}`
        : '/api/menu-items';
      
      const method = editItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          price: Number(price),
          category: category.trim() || null,
          image: imageUrl || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Failed to ${editItem ? 'update' : 'create'} item`);
      }

      setName('');
      setPrice('');
      setCategory('');
      setImage('');
      setImageFile(null);
      setDescription('');

      onSuccess?.();
    } catch (err: any) {
      setError(err.message ?? 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (checkingAuth) {
    return <div className="p-4 text-sm">Checking admin access…</div>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-md border border-slate-200 bg-white p-4"
    >
      <div className="min-w-[180px] flex-1">
        <label className="block text-xs font-medium text-slate-600">
          Name
        </label>
        <input
          className="mt-1 w-full rounded border px-2 py-1 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nasi Goreng Spesial"
        />
      </div>

      <div className="w-32">
        <label className="block text-xs font-medium text-slate-600">
          Price
        </label>
        <input
          type="number"
          min={0}
          step="0.01"
          className="mt-1 w-full rounded border px-2 py-1 text-sm"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="35000"
        />
      </div>

      <div className="w-40">
        <label className="block text-xs font-medium text-slate-600">
          Category
        </label>
        <select
          className="mt-1 w-full rounded border px-2 py-1 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[220px] flex-1">
        <label className="block text-xs font-medium text-slate-600">
          Image
        </label>
        <div className="mt-1">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImageFile(file);
                setImage('');
              }
            }}
            className="w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-slate-800"
          />
          {imageFile && (
            <p className="mt-1 text-xs text-slate-500">
              Selected: {imageFile.name}
            </p>
          )}
        </div>
      </div>

      <div className="basis-full">
        <label className="block text-xs font-medium text-slate-600">
          Description
        </label>
        <textarea
          className="mt-1 w-full rounded border px-2 py-1 text-sm"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description of the dish"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-9 rounded bg-slate-900 px-4 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting ? 'Saving…' : editItem ? 'Update menu item' : 'Add menu item'}
      </button>

      {error && (
        <p className="mt-2 w-full text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
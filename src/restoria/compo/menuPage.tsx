'use client';

import { useEffect, useState } from 'react';
import MenuCard from './menuCard';

type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image: string | null;
};

type MenuPageProps = {
  searchQuery: string;
  onBack?: () => void;
  onAddToCart: (item: MenuItem) => void;
};

export function MenuPage({
  searchQuery,
  onBack = () => {},
  onAddToCart,
}: MenuPageProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch('/api/menu-items');
        if (!res.ok) throw new Error('Failed to fetch menu');
        const data: MenuItem[] = await res.json();
        setItems(data);
      } catch (error) {
        console.error('Failed to load menu:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, []);


  const categories: string[] = [
    'all',
    ...new Set(
      items
        .map((item) => item.category)
        .filter((c): c is string => c !== null)
    ),
  ];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">

      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Kembali
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Menu Kami</h1>
            <div className="w-24" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {searchQuery && (
          <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
            <p className="text-emerald-800">
              Hasil pencarian untuk:{' '}
              <span className="font-bold">"{searchQuery}"</span>
            </p>
          </div>
        )}

        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-emerald-50'
              }`}
            >
              {cat === 'all'
                ? 'Semua'
                : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
              <p className="text-gray-600">Memuat menu...</p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              Tidak ada menu yang ditemukan
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <MenuCard
                key={item.id}
                id={item.id}
                name={item.name}
                description={item.description}
                price={item.price}
                category={item.category}
                image={item.image}
                onAddToCart={() => onAddToCart(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type HomePageProps = {
  onViewMenu: () => void;
  onSearch: (query: string) => void;
};

export function HomePage({ onViewMenu, onSearch }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-12">
    
        <div className="text-center mb-12">
          <div className="inline-block bg-emerald-600 rounded-full p-6 mb-6">
            <span className="text-6xl">🍽️</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Selamat Datang di <span className="text-emerald-600">Restoran Kami</span>
          </h1>
          <p className="text-xl text-gray-600">
            Nikmati hidangan terbaik dengan bahan berkualitas
          </p>
        </div>

       
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <input
                type="text"
                placeholder="Cari menu favorit Anda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-6 text-lg rounded-full border-2 border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 text-white px-6 py-2 rounded-full hover:bg-emerald-700"
            >
              Cari
            </button>
          </div>
        </form>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        
          <button
            onClick={onViewMenu}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
          >
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-2xl font-bold mb-2">Lihat Menu</h3>
            <p className="text-gray-600">
              Jelajahi menu lengkap kami
            </p>
          </button>

   
          <button
            onClick={() => router.push('/reserve')}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
          >
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold mb-2">Reservasi</h3>
            <p className="text-gray-600">
              Pesan meja Anda
            </p>
          </button>

          <button
            onClick={() => router.push('/order')}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
          >
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold mb-2">Pesanan Saya</h3>
            <p className="text-gray-600">
              Lacak status pesanan
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { HomePage } from '@/compo/homePage';
import { MenuPage } from '@/compo/menuPage';

type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image: string | null;
};

type CartItem = MenuItem & {
  quantity: number;
};

export default function Home() {
  const [currentView, setCurrentView] = useState<'home' | 'menu'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      
      return [...prevCart, { ...item, quantity: 1 }];
    });
    
    alert(`${item.name} ditambahkan ke keranjang!`);
  };

  return (
    <div className="min-h-screen">
      {currentView === 'home' ? (
        <HomePage
          onViewMenu={() => {
            setSearchQuery('');
            setCurrentView('menu');
          }}
          onViewOrders={() => {
            alert('Halaman pesanan akan segera hadir!');
          }}
          onReservation={() => {
            alert('Halaman reservasi akan segera hadir!');
          }}
          onSearch={(query) => {
            setSearchQuery(query);
            setCurrentView('menu');
          }}
        />
      ) : (
        <MenuPage
          searchQuery={searchQuery}
          onBack={() => {
            setSearchQuery('');
            setCurrentView('home');
          }}
          onAddToCart={addToCart}
        />
      )}

      {/* Cart Badge (floating button) */}
      {cart.length > 0 && (
        <button
          onClick={() => {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            alert(`Keranjang Anda:\n${totalItems} item\nTotal: Rp ${totalPrice.toLocaleString('id-ID')}`);
          }}
          className="fixed bottom-6 right-6 bg-emerald-600 text-white rounded-full p-4 shadow-2xl hover:bg-emerald-700 transition-all hover:scale-110 z-50"
        >
          <div className="relative">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
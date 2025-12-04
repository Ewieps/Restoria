'use client';

import { useState } from 'react';
import { HomePage } from '@/compo/homePage';

export default function Home() {
  const [currentView, setCurrentView] = useState<'home' | 'menu'>('home');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen">
      {currentView === 'home' ? (
        <HomePage
          onViewMenu={() => {
            setSearchQuery('');
            setCurrentView('menu');
          }}
          onViewOrders={() => {
            alert('Orders page coming soon!');
          }}
          onReservation={() => {
            alert('Reservation page coming soon!');
          }}
          onSearch={(query) => {
            setSearchQuery(query);
            setCurrentView('menu');
          }}
        />
      ) : (
        <div className="min-h-screen bg-gray-50 p-8">
          <button
            onClick={() => setCurrentView('home')}
            className="mb-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold mb-4">Menu Page</h1>
          {searchQuery && (
            <p className="text-gray-600">Searching for: {searchQuery}</p>
          )}
          <p className="text-gray-500 mt-4">Menu content will go here...</p>
        </div>
      )}
    </div>
  );
}
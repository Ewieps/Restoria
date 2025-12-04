'use client';

import Image from 'next/image';

interface MenuCardProps {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  image?: string | null;
  onAddToCart?: (id: number) => void;
}

export default function MenuCard({
  id,
  name,
  description,
  price,
  category,
  image,
  onAddToCart,
}: MenuCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-xl dark:bg-zinc-900/80 dark:backdrop-blur-sm">
      <div className="relative h-56 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-16 w-16 text-zinc-300 dark:text-zinc-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        {category && (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wide text-white shadow-lg backdrop-blur-sm">
              {category}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold text-slate-800 text-zinc-900 dark:text-white">
          {name}
        </h3>
        
        {description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        )}

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-2xl font-bold text-slate-800 text-emerald-600 dark:text-emerald-400">
              {formatPrice(price)}
            </span>
            
            <button
              onClick={() => onAddToCart?.(id)}
              className="flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 text-sm font-semibold text-slate-700 text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95"
              aria-label={`Add ${name} to cart`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
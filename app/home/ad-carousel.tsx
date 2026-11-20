'use client';

import { useEffect, useState } from 'react';
import type { MerchantAd } from '@/lib/types';

export default function AdCarousel({ ads }: { ads: MerchantAd[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads.length]);

  if (ads.length === 0) return null;

  const ad = ads[current];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white h-44 mb-6">
      {/* Achtergrond-afbeelding */}
      {ad.image_url && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${ad.image_url})` }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/70 to-transparent" />

      {/* Content */}
      <div className="relative h-full p-6 flex flex-col justify-center">
        <p className="text-xs uppercase tracking-wide text-white/70">
          {ad.merchant_name}
        </p>
        <h3 className="text-xl font-bold mt-1">{ad.title}</h3>
        {ad.description && (
          <p className="text-sm text-white/80 mt-1 line-clamp-2">
            {ad.description}
          </p>
        )}
      </div>

      {/* Dots voor handmatige navigatie */}
      {ads.length > 1 && (
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
              }`}
              aria-label={`Ad ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
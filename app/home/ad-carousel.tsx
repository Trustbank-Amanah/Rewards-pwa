'use client';

import { useEffect, useState } from 'react';
import type { MerchantAd } from '@/lib/types';

export default function AdCarousel({ ads }: { ads: MerchantAd[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % ads.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [ads.length]);

  if (ads.length === 0) return null;

  const ad = ads[current];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white h-48 mb-6">
      {/* Achtergrond-afbeelding */}
      {ad.image_url && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${ad.image_url})` }}
        />
      )}

      {/* Donkere gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content — alleen merchant-naam */}
      <div className="relative h-full p-5 flex flex-col justify-end">
        <p className="text-xs uppercase tracking-wide text-white/70 font-medium mb-1">
          Deelnemende merchant
        </p>
        <h3 className="text-2xl font-bold leading-tight">{ad.merchant_name}</h3>
      </div>

      {/* Dots */}
      {ads.length > 1 && (
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
              }`}
              aria-label={`Merchant ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
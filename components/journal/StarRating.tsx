'use client';

// =============================================================================
// Star Rating — 1-5 star emotion/discipline selector
// =============================================================================

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  readonly?: boolean;
}

export default function StarRating({
  value,
  onChange,
  size = 24,
  readonly = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverValue || value);
        return (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onChange(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            disabled={readonly}
            className={`transition-all duration-150 ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
          >
            <Star
              size={size}
              className={`transition-colors duration-150 ${
                isFilled
                  ? 'fill-[var(--accent-gold)] text-[var(--accent-gold)]'
                  : 'text-[var(--muted-fg)] opacity-40'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

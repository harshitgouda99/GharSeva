import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, onRatingChange = null, size = 20, maxStars = 5 }) => {
  const stars = [];
  
  for (let i = 1; i <= maxStars; i++) {
    const isFilled = i <= rating;
    stars.push(
      <Star
        key={i}
        size={size}
        className={`${isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} ${onRatingChange ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
        onClick={() => onRatingChange && onRatingChange(i)}
      />
    );
  }
  
  return <div className="flex gap-1 items-center">{stars}</div>;
};

export default StarRating;

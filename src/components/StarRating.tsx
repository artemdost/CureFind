interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md';
}

export default function StarRating({ rating, size = 'sm' }: StarRatingProps) {
  const stars = [];
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  const sizeClass = size === 'sm' ? 'text-sm' : 'text-base';

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<span key={i} className={`star-filled ${sizeClass}`}>&#9733;</span>);
    } else if (i === full && hasHalf) {
      stars.push(<span key={i} className={`star-filled ${sizeClass}`}>&#9733;</span>);
    } else {
      stars.push(<span key={i} className={`star-empty ${sizeClass}`}>&#9733;</span>);
    }
  }

  return <span className="inline-flex gap-0.5">{stars}</span>;
}

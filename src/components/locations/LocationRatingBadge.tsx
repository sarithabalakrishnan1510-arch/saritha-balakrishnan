import React from 'react';
import { Star } from 'lucide-react';
import { useLocationReviews } from '../../lib/store/locationReviewsStore';

interface LocationRatingBadgeProps {
  locationId: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
  onClick?: () => void;
}

export const LocationRatingBadge: React.FC<LocationRatingBadgeProps> = ({
  locationId,
  size = 'md',
  showCount = true,
  className = '',
  onClick
}) => {
  const { getLocationRatingSummary } = useLocationReviews();
  const summary = getLocationRatingSummary(locationId);

  if (summary.reviewCount === 0) {
    return (
      <div 
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-xs font-medium ${className}`}
        onClick={onClick}
      >
        <Star className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-[11px]">New Venue</span>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2'
  };

  const starSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold backdrop-blur-sm transition-colors ${
        onClick ? 'cursor-pointer hover:bg-amber-500/25' : ''
      } ${sizeClasses[size]} ${className}`}
      title={`${summary.averageRating} out of 5 stars based on ${summary.reviewCount} production reviews`}
    >
      <Star className={`${starSizes[size]} fill-amber-400 text-amber-400 shrink-0`} />
      <span>{summary.averageRating.toFixed(1)}</span>
      {showCount && (
        <span className="text-amber-200/70 font-medium text-[11px]">
          ({summary.reviewCount})
        </span>
      )}
    </div>
  );
};

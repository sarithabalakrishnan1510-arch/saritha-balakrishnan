import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LocationReview, LocationRatingSummary } from '../../types';
import { INITIAL_LOCATION_REVIEWS } from '../data/locationReviews';

const STORAGE_KEY = 'cast_kerala_location_reviews_v1';

export interface LocationReviewsContextType {
  reviews: LocationReview[];
  getLocationReviews: (locationId: string) => LocationReview[];
  getLocationRatingSummary: (locationId: string) => LocationRatingSummary;
  addReview: (reviewData: Omit<LocationReview, 'id' | 'created_at' | 'helpful_votes' | 'voted_user_ids'>) => LocationReview;
  voteHelpful: (reviewId: string, userId?: string) => { success: boolean; isVoted: boolean };
  hasUserVoted: (reviewId: string, userId?: string) => boolean;
  deleteReview: (reviewId: string) => void;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  dismissToast: () => void;
}

const LocationReviewsContext = createContext<LocationReviewsContextType | null>(null);

export const LocationReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = useState<LocationReview[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: LocationReview[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge any new initial reviews that might not be in the stored list
          const existingIds = new Set(parsed.map(r => r.id));
          const missingInitials = INITIAL_LOCATION_REVIEWS.filter(r => !existingIds.has(r.id));
          return [...parsed, ...missingInitials];
        }
      }
    } catch (e) {
      console.error('Failed to parse location reviews from localStorage', e);
    }
    return INITIAL_LOCATION_REVIEWS;
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch (e) {
      console.error('Failed to save location reviews to localStorage', e);
    }
  }, [reviews]);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const getLocationReviews = useCallback((locationId: string): LocationReview[] => {
    return reviews.filter(r => r.location_id === locationId);
  }, [reviews]);

  const getLocationRatingSummary = useCallback((locationId: string): LocationRatingSummary => {
    const locReviews = reviews.filter(r => r.location_id === locationId);

    if (locReviews.length === 0) {
      return {
        averageRating: 0,
        reviewCount: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        subRatings: {
          accessibility: 0,
          power: 0,
          amenities: 0,
          acoustics: 0,
          cooperation: 0
        },
        recommendPercentage: 0
      };
    }

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalOverall = 0;
    let totalAccess = 0;
    let totalPower = 0;
    let totalAmenities = 0;
    let totalAcoustics = 0;
    let totalCoop = 0;
    let recommendCount = 0;

    locReviews.forEach(r => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.overall_rating)));
      distribution[rounded] = (distribution[rounded] || 0) + 1;

      totalOverall += r.overall_rating;
      totalAccess += r.accessibility_rating || r.overall_rating;
      totalPower += r.power_backup_rating || r.overall_rating;
      totalAmenities += r.amenities_rating || r.overall_rating;
      totalAcoustics += r.noise_acoustics_rating || r.overall_rating;
      totalCoop += r.caretaker_cooperation_rating || r.overall_rating;

      if (r.recommend_to_crews) {
        recommendCount++;
      }
    });

    const count = locReviews.length;

    return {
      averageRating: Number((totalOverall / count).toFixed(1)),
      reviewCount: count,
      ratingDistribution: distribution,
      subRatings: {
        accessibility: Number((totalAccess / count).toFixed(1)),
        power: Number((totalPower / count).toFixed(1)),
        amenities: Number((totalAmenities / count).toFixed(1)),
        acoustics: Number((totalAcoustics / count).toFixed(1)),
        cooperation: Number((totalCoop / count).toFixed(1))
      },
      recommendPercentage: Math.round((recommendCount / count) * 100)
    };
  }, [reviews]);

  const addReview = useCallback((
    reviewData: Omit<LocationReview, 'id' | 'created_at' | 'helpful_votes' | 'voted_user_ids'>
  ): LocationReview => {
    const newReview: LocationReview = {
      ...reviewData,
      id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      helpful_votes: 0,
      voted_user_ids: [],
      created_at: new Date().toISOString()
    };

    setReviews(prev => [newReview, ...prev]);

    setToast({
      message: 'Production review published successfully! Thank you for helping film crews.',
      type: 'success'
    });

    return newReview;
  }, []);

  const hasUserVoted = useCallback((reviewId: string, userId?: string): boolean => {
    const effectiveUserId = userId || 'current_user_guest';
    const rev = reviews.find(r => r.id === reviewId);
    return rev ? rev.voted_user_ids.includes(effectiveUserId) : false;
  }, [reviews]);

  const voteHelpful = useCallback((reviewId: string, userId?: string): { success: boolean; isVoted: boolean } => {
    const effectiveUserId = userId || 'current_user_guest';
    let isNowVoted = false;

    setReviews(prev =>
      prev.map(r => {
        if (r.id === reviewId) {
          const alreadyVoted = r.voted_user_ids.includes(effectiveUserId);
          if (alreadyVoted) {
            // Un-vote
            isNowVoted = false;
            return {
              ...r,
              helpful_votes: Math.max(0, r.helpful_votes - 1),
              voted_user_ids: r.voted_user_ids.filter(id => id !== effectiveUserId)
            };
          } else {
            // Add vote
            isNowVoted = true;
            return {
              ...r,
              helpful_votes: r.helpful_votes + 1,
              voted_user_ids: [...r.voted_user_ids, effectiveUserId]
            };
          }
        }
        return r;
      })
    );

    setToast({
      message: isNowVoted ? 'Marked as helpful review.' : 'Removed helpful vote.',
      type: 'info'
    });

    return { success: true, isVoted: isNowVoted };
  }, []);

  const deleteReview = useCallback((reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    setToast({
      message: 'Review removed.',
      type: 'info'
    });
  }, []);

  return (
    <LocationReviewsContext.Provider
      value={{
        reviews,
        getLocationReviews,
        getLocationRatingSummary,
        addReview,
        voteHelpful,
        hasUserVoted,
        deleteReview,
        toast,
        dismissToast
      }}
    >
      {children}
      {/* Toast Notification */}
      {toast && (
        <div 
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/95 text-white border border-white/15 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300"
          role="alert"
        >
          <div className={`w-2.5 h-2.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'error' ? 'bg-rose-400' : 'bg-amber-400'}`} />
          <p className="text-xs font-medium text-zinc-200">{toast.message}</p>
          <button
            onClick={dismissToast}
            className="text-zinc-400 hover:text-white text-xs font-bold ml-2 p-1"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}
    </LocationReviewsContext.Provider>
  );
};

export const useLocationReviews = () => {
  const context = useContext(LocationReviewsContext);
  if (!context) {
    throw new Error('useLocationReviews must be used within a LocationReviewsProvider');
  }
  return context;
};

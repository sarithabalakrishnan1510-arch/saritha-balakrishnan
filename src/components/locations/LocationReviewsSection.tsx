import React, { useState, useMemo } from 'react';
import { 
  Star, 
  Sparkles, 
  ThumbsUp, 
  ShieldCheck, 
  MessageSquare, 
  SlidersHorizontal, 
  Check, 
  Plus, 
  Truck, 
  Zap, 
  Home, 
  Volume2, 
  Users2, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Clapperboard
} from 'lucide-react';
import { ShootingLocation, LocationReview } from '../../types';
import { useLocationReviews } from '../../lib/store/locationReviewsStore';
import { useApp } from '../../lib/store/appStore';
import { WriteLocationReviewModal } from './WriteLocationReviewModal';

interface LocationReviewsSectionProps {
  location: ShootingLocation;
}

type SortOption = 'helpful' | 'newest' | 'rating_desc';

export const LocationReviewsSection: React.FC<LocationReviewsSectionProps> = ({ location }) => {
  const { getLocationReviews, getLocationRatingSummary, voteHelpful, hasUserVoted } = useLocationReviews();
  const { currentUser } = useApp();

  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | 'all'>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('helpful');
  const [expandedSubRatings, setExpandedSubRatings] = useState<Record<string, boolean>>({});

  const summary = getLocationRatingSummary(location.id);
  const rawReviews = getLocationReviews(location.id);

  const toggleSubRatings = (revId: string) => {
    setExpandedSubRatings(prev => ({ ...prev, [revId]: !prev[revId] }));
  };

  // Filter & Sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let result = [...rawReviews];

    // Star filter
    if (selectedStarFilter !== 'all') {
      result = result.filter(r => Math.round(r.overall_rating) === selectedStarFilter);
    }

    // Role filter
    if (selectedRoleFilter !== 'all') {
      result = result.filter(r => r.author_role.toLowerCase().includes(selectedRoleFilter.toLowerCase()));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'helpful') {
        return b.helpful_votes - a.helpful_votes;
      }
      if (sortBy === 'rating_desc') {
        return b.overall_rating - a.overall_rating;
      }
      // newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [rawReviews, selectedStarFilter, selectedRoleFilter, sortBy]);

  // Unique roles for filter dropdown
  const availableRoles = useMemo(() => {
    const set = new Set<string>();
    rawReviews.forEach(r => {
      if (r.author_role) set.add(r.author_role);
    });
    return Array.from(set);
  }, [rawReviews]);

  return (
    <div id="location-reviews-section" className="space-y-6 pt-4 border-t border-white/10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </span>
            <h3 className="text-base sm:text-lg font-bold font-cinematic text-white">
              Production Reviews & Crew Recce Logs
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real shoot feedback from Malayalam line producers, cinematographers, and location scouts.
          </p>
        </div>

        <button
          id="write-location-review-btn"
          type="button"
          onClick={() => setIsWriteModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Write Production Review</span>
        </button>
      </div>

      {/* Aggregate Rating Overview Cards */}
      {summary.reviewCount > 0 ? (
        <div className="p-5 rounded-2xl bg-black/40 border border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Big Score Card */}
          <div className="lg:col-span-4 text-center lg:text-left flex flex-col items-center lg:items-start justify-center space-y-1.5 lg:border-r lg:border-white/10 lg:pr-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-white font-cinematic tracking-tight">
                {summary.averageRating.toFixed(1)}
              </span>
              <span className="text-base text-zinc-500 font-medium">/ 5.0</span>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    summary.averageRating >= star
                      ? 'fill-amber-400 text-amber-400'
                      : summary.averageRating >= star - 0.5
                      ? 'fill-amber-400/50 text-amber-400'
                      : 'text-zinc-600'
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-zinc-400">
              Based on <span className="font-semibold text-white">{summary.reviewCount} verified</span> production logs
            </p>

            {summary.recommendPercentage > 0 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{summary.recommendPercentage}% of crews recommend</span>
              </div>
            )}
          </div>

          {/* Sub-Category Technical Metrics */}
          <div className="lg:col-span-5 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-2">
              On-Set Feasibility Ratings
            </span>

            {/* Heavy Vehicle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-sky-400" />
                  <span>Truck & Crane Access</span>
                </span>
                <span className="font-bold text-white">{summary.subRatings.accessibility}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-sky-400 rounded-full transition-all duration-500" 
                  style={{ width: `${(summary.subRatings.accessibility / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Generator & Power */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sync Generator & Power</span>
                </span>
                <span className="font-bold text-white">{summary.subRatings.power}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                  style={{ width: `${(summary.subRatings.power / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Green Rooms */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Green Rooms & Restrooms</span>
                </span>
                <span className="font-bold text-white">{summary.subRatings.amenities}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500" 
                  style={{ width: `${(summary.subRatings.amenities / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Sync Sound */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sync Sound Viability</span>
                </span>
                <span className="font-bold text-white">{summary.subRatings.acoustics}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-indigo-400 rounded-full transition-all duration-500" 
                  style={{ width: `${(summary.subRatings.acoustics / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Caretaker */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Users2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Panchayat & Caretaker Liaison</span>
                </span>
                <span className="font-bold text-white">{summary.subRatings.cooperation}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-rose-400 rounded-full transition-all duration-500" 
                  style={{ width: `${(summary.subRatings.cooperation / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Rating Distribution Histogram */}
          <div className="lg:col-span-3 space-y-1.5 text-xs lg:border-l lg:border-white/10 lg:pl-6">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-2">
              Star Breakdown
            </span>

            {[5, 4, 3, 2, 1].map((stars) => {
              const count = summary.ratingDistribution[stars] || 0;
              const percent = summary.reviewCount > 0 ? (count / summary.reviewCount) * 100 : 0;
              const isSelected = selectedStarFilter === stars;

              return (
                <button
                  key={stars}
                  type="button"
                  onClick={() => setSelectedStarFilter(isSelected ? 'all' : stars)}
                  className={`w-full flex items-center gap-2 group text-left p-1 rounded-lg transition-colors ${
                    isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <span className="w-8 font-medium text-zinc-400 flex items-center gap-0.5 shrink-0 text-[11px]">
                    {stars} <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        isSelected ? 'bg-amber-400' : 'bg-amber-500/70 group-hover:bg-amber-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-5 text-right font-mono text-[10px] text-zinc-400">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-black/40 border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 text-amber-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">No Production Reviews Yet</h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
              Have you shot a scene, teaser, or ad at {location.title}? Be the first production house or scout to share logistical feedback.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsWriteModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors"
          >
            Leave First Recce Review
          </button>
        </div>
      )}

      {/* Filter and Sort Toolbar */}
      {summary.reviewCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-white/5 p-3 rounded-xl border border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-zinc-400 flex items-center gap-1 font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </span>

            {/* Star Filters */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedStarFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  selectedStarFilter === 'all'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                }`}
              >
                All Stars
              </button>
              {[5, 4, 3].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStarFilter(selectedStarFilter === s ? 'all' : s)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors ${
                    selectedStarFilter === s
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                  }`}
                >
                  <span>{s}</span>
                  <Star className="w-2.5 h-2.5 fill-current" />
                </button>
              ))}
            </div>

            {/* Crew Role Filter */}
            {availableRoles.length > 0 && (
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-[#1a1c28] border border-white/10 text-zinc-300 text-[11px] focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Crew Roles</option>
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            )}

            {(selectedStarFilter !== 'all' || selectedRoleFilter !== 'all') && (
              <button
                onClick={() => {
                  setSelectedStarFilter('all');
                  setSelectedRoleFilter('all');
                }}
                className="text-[11px] text-rose-400 hover:underline font-medium"
              >
                Reset
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-2.5 py-1 rounded-lg bg-[#1a1c28] border border-white/10 text-zinc-200 text-[11px] focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="helpful">Most Helpful</option>
              <option value="newest">Newest First</option>
              <option value="rating_desc">Highest Rating</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredAndSortedReviews.map((review) => {
          const isVoted = hasUserVoted(review.id, currentUser?.id);
          const showSub = expandedSubRatings[review.id];

          return (
            <div
              key={review.id}
              className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-3.5 hover:border-white/20 transition-all text-xs"
            >
              {/* Author & Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600/30 to-rose-600/30 border border-white/15 flex items-center justify-center font-bold text-amber-300 shrink-0 text-sm">
                    {review.author_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">
                        {review.author_name}
                      </span>
                      {review.verified_production && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Verified Crew
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 flex-wrap">
                      <span className="text-amber-300 font-medium">{review.author_role}</span>
                      {review.production_house && (
                        <>
                          <span>•</span>
                          <span className="text-zinc-300">{review.production_house}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating & Shoot info */}
                <div className="flex items-center gap-3 sm:text-right">
                  <div className="space-y-0.5">
                    <div className="flex items-center sm:justify-end gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            review.overall_rating >= s
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-600'
                          }`}
                        />
                      ))}
                      <span className="font-bold text-white ml-1">{review.overall_rating}.0</span>
                    </div>

                    <div className="flex items-center sm:justify-end gap-1.5 text-[10px] text-zinc-400">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      <span>{review.shoot_date}</span>
                      <span>•</span>
                      <span>{review.shoot_duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Badge if present */}
              {review.project_title && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-zinc-300">
                  <Clapperboard className="w-3 h-3 text-amber-400" />
                  <span>Project: <strong>{review.project_title}</strong></span>
                </div>
              )}

              {/* Review Text Body */}
              <p className="text-zinc-300 text-xs sm:text-[13px] leading-relaxed">
                {review.review_text}
              </p>

              {/* Pros & Cons Tags */}
              {((review.pros && review.pros.length > 0) || (review.cons && review.cons.length > 0)) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {review.pros && review.pros.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                        Advantages
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {review.pros.map((p, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium"
                          >
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {review.cons && review.cons.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                        Logistics Caution
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {review.cons.map((c, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-rose-950/60 text-rose-300 border border-rose-500/30 text-[11px] font-medium"
                          >
                            ⚠ {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Ratings Toggle Details */}
              {showSub && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] animate-in fade-in duration-150">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Crane/Road Access</span>
                    <span className="font-bold text-sky-400">★ {review.accessibility_rating}.0</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Power & Generator</span>
                    <span className="font-bold text-amber-400">★ {review.power_backup_rating}.0</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Green Rooms</span>
                    <span className="font-bold text-emerald-400">★ {review.amenities_rating}.0</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Sync Sound Viability</span>
                    <span className="font-bold text-indigo-400">★ {review.noise_acoustics_rating}.0</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Caretaker Support</span>
                    <span className="font-bold text-rose-400">★ {review.caretaker_cooperation_rating}.0</span>
                  </div>
                </div>
              )}

              {/* Review Card Footer: Helpful Button & Recommendation */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3 text-[11px]">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => voteHelpful(review.id, currentUser?.id)}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors border font-medium ${
                      isVoted
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border-white/10'
                    }`}
                    title="Mark this production review as helpful"
                  >
                    <ThumbsUp className={`w-3 h-3 ${isVoted ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span>Helpful ({review.helpful_votes})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSubRatings(review.id)}
                    className="text-zinc-400 hover:text-white text-[11px] flex items-center gap-1"
                  >
                    <span>{showSub ? 'Hide specs' : 'View specs'}</span>
                    {showSub ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {review.recommend_to_crews && (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                    <Check className="w-3.5 h-3.5" />
                    <span>Recommends Venue</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Write Review Modal */}
      <WriteLocationReviewModal
        location={location}
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
      />
    </div>
  );
};

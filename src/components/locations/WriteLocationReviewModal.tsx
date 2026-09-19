import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  ThumbsUp, 
  Truck, 
  Zap, 
  Home, 
  Volume2, 
  Users2, 
  Clapperboard, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { ShootingLocation, ProductionCrewRole, LocationReview } from '../../types';
import { useLocationReviews } from '../../lib/store/locationReviewsStore';
import { useApp } from '../../lib/store/appStore';

interface WriteLocationReviewModalProps {
  location: ShootingLocation | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COMMON_PROS = [
  'Wide crane & Jimmy Jib clearance',
  '3-Phase power & sync generator space',
  'Total acoustic isolation for sync sound',
  'Cooperative panchayat & police clearance',
  'Spacious AC green rooms for cast',
  'Adequate parking for 30+ unit vehicles',
  'Natural morning golden hour diffusion'
];

const COMMON_CONS = [
  'Narrow approach road for 40ft trailers',
  'Nearby temple/highway ambient noise',
  'Mobile network dead-zone indoors',
  'Strict no-open-flame fire regulations',
  'Tiled floor flutter echo requires blankets'
];

const CREW_ROLES: ProductionCrewRole[] = [
  'Line Producer',
  'Production Controller',
  'Cinematographer (DoP)',
  'Art Director / Production Designer',
  'Location Manager / Scout',
  'Director',
  'Associate Director',
  'Sound Recordist / Sync Sound Engineer',
  'Gaffer / Chief Light Technician',
  'Other Crew'
];

export const WriteLocationReviewModal: React.FC<WriteLocationReviewModalProps> = ({
  location,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { addReview } = useLocationReviews();
  const { currentUser, currentProduction } = useApp();

  // Form State
  const [overallRating, setOverallRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Sub-criteria Ratings
  const [accessibilityRating, setAccessibilityRating] = useState<number>(4);
  const [powerRating, setPowerRating] = useState<number>(5);
  const [amenitiesRating, setAmenitiesRating] = useState<number>(4);
  const [acousticsRating, setAcousticsRating] = useState<number>(4);
  const [cooperationRating, setCooperationRating] = useState<number>(5);

  // Reviewer Metadata
  const [authorName, setAuthorName] = useState<string>(currentUser?.full_name || '');
  const [authorRole, setAuthorRole] = useState<ProductionCrewRole>('Line Producer');
  const [productionHouse, setProductionHouse] = useState<string>(
    currentProduction?.company_name || 'Independent Banner'
  );
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [shootDate, setShootDate] = useState<string>('August 2026');
  const [shootDuration, setShootDuration] = useState<string>('4-Day Schedule');

  // Text Review
  const [reviewText, setReviewText] = useState<string>('');
  const [recommend, setRecommend] = useState<boolean>(true);

  // Pros & Cons
  const [selectedPros, setSelectedPros] = useState<string[]>([]);
  const [customPro, setCustomPro] = useState<string>('');
  const [selectedCons, setSelectedCons] = useState<string[]>([]);
  const [customCon, setCustomCon] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !location) return null;

  const togglePro = (item: string) => {
    setSelectedPros(prev => 
      prev.includes(item) ? prev.filter(p => p !== item) : [...prev, item]
    );
  };

  const handleAddCustomPro = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPro.trim() && !selectedPros.includes(customPro.trim())) {
      setSelectedPros(prev => [...prev, customPro.trim()]);
      setCustomPro('');
    }
  };

  const toggleCon = (item: string) => {
    setSelectedCons(prev => 
      prev.includes(item) ? prev.filter(c => c !== item) : [...prev, item]
    );
  };

  const handleAddCustomCon = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCon.trim() && !selectedCons.includes(customCon.trim())) {
      setSelectedCons(prev => [...prev, customCon.trim()]);
      setCustomCon('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!authorName.trim()) {
      setErrorMsg('Please enter your name or production handle.');
      return;
    }

    if (!reviewText.trim() || reviewText.trim().length < 20) {
      setErrorMsg('Please provide a brief recce/shoot feedback (at least 20 characters) for production teams.');
      return;
    }

    setIsSubmitting(true);

    try {
      addReview({
        location_id: location.id,
        author_user_id: currentUser?.id || `anon_${Date.now()}`,
        author_name: authorName.trim(),
        author_role: authorRole,
        production_house: productionHouse.trim() || undefined,
        project_title: projectTitle.trim() || undefined,
        overall_rating: overallRating,
        accessibility_rating: accessibilityRating,
        power_backup_rating: powerRating,
        amenities_rating: amenitiesRating,
        noise_acoustics_rating: acousticsRating,
        caretaker_cooperation_rating: cooperationRating,
        shoot_date: shootDate.trim() || 'Recent Shoot',
        shoot_duration: shootDuration.trim() || '1-Day Shift',
        review_text: reviewText.trim(),
        pros: selectedPros,
        cons: selectedCons,
        recommend_to_crews: recommend,
        verified_production: currentUser?.role === 'production' || !!currentProduction
      });

      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
      setErrorMsg('Failed to submit review. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="write-location-review-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="write-location-review-dialog"
        className="relative w-full max-w-2xl rounded-3xl bg-[#12141e] border border-white/15 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#161824] border-b border-white/10 shrink-0">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Clapperboard className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold font-cinematic truncate text-white">
                Share Production Recce & Shoot Feedback
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 truncate">
              Reviewing: <span className="text-amber-300 font-semibold">{location.title}</span> ({location.city})
            </p>
          </div>

          <button
            id="close-write-review-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Overall Score Selector */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-center">
            <label className="text-xs uppercase tracking-wider font-semibold text-zinc-300 block">
              Overall Production Rating
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hoverRating !== null ? hoverRating : overallRating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setOverallRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 focus:outline-none transition-transform hover:scale-125"
                    title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        filled ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-amber-300 block">
              {overallRating === 5 && '5.0 - Exceptional Film Location (Highly Recommended)'}
              {overallRating === 4 && '4.0 - Good Venue (Minor Logistics Precautions)'}
              {overallRating === 3 && '3.0 - Decent (Requires Extra Crew Preparation)'}
              {overallRating === 2 && '2.0 - Challenging Logistics'}
              {overallRating === 1 && '1.0 - Severe Constraints for Heavy Shoots'}
            </span>
          </div>

          {/* 2. Sub-Category Technical Metrics */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Technical & Logistical Breakdown (1 to 5 Stars)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Access */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-400" />
                  <div>
                    <span className="text-xs font-medium text-white block">Heavy Vehicle Access</span>
                    <span className="text-[10px] text-zinc-400">40ft trailer / Jimmy Jib road</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAccessibilityRating(s)}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          accessibilityRating >= s ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Power */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-medium text-white block">Power & Generator</span>
                    <span className="text-[10px] text-zinc-400">3-Phase & soundproof parking</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPowerRating(s)}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          powerRating >= s ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Green Rooms */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-medium text-white block">Green Rooms & Washrooms</span>
                    <span className="text-[10px] text-zinc-400">AC makeup room & unit toilets</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAmenitiesRating(s)}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          amenitiesRating >= s ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Sync Sound Acoustics */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="text-xs font-medium text-white block">Sync Sound Viability</span>
                    <span className="text-[10px] text-zinc-400">Ambient noise & flutter echo</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAcousticsRating(s)}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          acousticsRating >= s ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Panchayat & Caretaker Support */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between sm:col-span-2">
                <div className="flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-rose-400" />
                  <div>
                    <span className="text-xs font-medium text-white block">Panchayat & Caretaker Liaison</span>
                    <span className="text-[10px] text-zinc-400">Single window clearance ease & on-time gate access</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCooperationRating(s)}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          cooperationRating >= s ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Reviewer Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Reviewer & Production Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Antony Perumbavoor"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                  Crew Role *
                </label>
                <select
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value as ProductionCrewRole)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a1c28] border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
                >
                  {CREW_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                  Production Banner / Studio
                </label>
                <input
                  type="text"
                  value={productionHouse}
                  onChange={(e) => setProductionHouse(e.target.value)}
                  placeholder="e.g. Aashirvad Cinemas / Friday Film House"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                  Project Title / Format (Optional)
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Feature Film / Ad Campaign"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                  Shoot Month & Year
                </label>
                <input
                  type="text"
                  value={shootDate}
                  onChange={(e) => setShootDate(e.target.value)}
                  placeholder="e.g. August 2026"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                  Shoot Duration / Shift
                </label>
                <input
                  type="text"
                  value={shootDuration}
                  onChange={(e) => setShootDuration(e.target.value)}
                  placeholder="e.g. 5-Day Schedule / 2-Day Night Shoot"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* 4. Written Experience & Recce Advice */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Recce Insights & Crew Experience *
            </label>
            <textarea
              required
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share practical on-set insights for fellow filmmakers: What worked well? How was the light at golden hour? Were there any generator noise concerns, road bottlenecks, or panchayat formalities?"
              className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-xs leading-relaxed"
            />
            <p className="text-[10px] text-zinc-500 text-right">
              {reviewText.length} characters (minimum 20)
            </p>
          </div>

          {/* 5. Quick Pros & Cons Tags */}
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                Highlight Advantages (Pros)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_PROS.map(pro => {
                  const isSelected = selectedPros.includes(pro);
                  return (
                    <button
                      key={pro}
                      type="button"
                      onClick={() => togglePro(pro)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white border border-emerald-400 shadow-sm'
                          : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      + {pro}
                    </button>
                  );
                })}
              </div>

              {/* Custom Pro Input */}
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={customPro}
                  onChange={(e) => setCustomPro(e.target.value)}
                  placeholder="Add custom pro..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomPro(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomPro}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-rose-400 block">
                Cautions & Logistics Notices (Cons)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_CONS.map(con => {
                  const isSelected = selectedCons.includes(con);
                  return (
                    <button
                      key={con}
                      type="button"
                      onClick={() => toggleCon(con)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-rose-600 text-white border border-rose-400 shadow-sm'
                          : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      - {con}
                    </button>
                  );
                })}
              </div>

              {/* Custom Con Input */}
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={customCon}
                  onChange={(e) => setCustomCon(e.target.value)}
                  placeholder="Add custom caution / con..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-rose-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomCon(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomCon}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* 6. Recommendation Checkbox */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ThumbsUp className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Recommend to Other Production Crews?
                </span>
                <span className="text-[10px] text-zinc-400">
                  Adds this venue to verified Malayalam film recommendation lists
                </span>
              </div>
            </div>

            <input
              type="checkbox"
              id="recommend-crew-checkbox"
              checked={recommend}
              onChange={(e) => setRecommend(e.target.checked)}
              className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400 bg-zinc-900 border-white/20"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-950/40 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Production Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

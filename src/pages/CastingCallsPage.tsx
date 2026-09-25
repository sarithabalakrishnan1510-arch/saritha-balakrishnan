import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Heart
} from 'lucide-react';
import { useApp } from '../lib/store/appStore';
import { useFavorites } from '../lib/store/favoritesStore';
import { CastingCard } from '../components/casting/CastingCard';
import { ApplyModal } from '../components/casting/ApplyModal';
import { MatchBreakdownModal } from '../components/casting/MatchBreakdownModal';
import { CastingRole, CastingCall } from '../types';
import { KERALA_DISTRICTS, TALENT_CATEGORIES } from '../lib/constants';
import { calculateRoleMatchScore } from '../lib/matching/engine';

export const CastingCallsPage: React.FC = () => {
  const { castingCalls, castingRoles, currentUser, currentTalent } = useApp();
  const { savedCastingIds } = useFavorites();

  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';
  const [search, setSearch] = useState(initialQuery);

  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('search');
    if (q !== null) {
      setSearch(q);
    }
  }, [searchParams]);
  const [districtFilter, setDistrictFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [matchThreshold, setMatchThreshold] = useState<number>(0); // 0, 70, 85
  const [paidOnly, setPaidOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);

  // Modals
  const [applyRole, setApplyRole] = useState<CastingRole | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [breakdownRole, setBreakdownRole] = useState<CastingRole | null>(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  // Filter casting calls
  const filteredCalls = castingCalls.filter(call => {
    // Only approved/published calls for public view (unless admin)
    if (currentUser?.role !== 'admin' && call.status !== 'published') return false;

    // Search text match
    if (search.trim()) {
      const q = search.toLowerCase();
      const textMatch =
        call.title.toLowerCase().includes(q) ||
        call.description.toLowerCase().includes(q) ||
        call.company_name?.toLowerCase().includes(q);
      if (!textMatch) {
        // Also check if any role inside matches
        const roles = castingRoles.filter(r => r.casting_call_id === call.id);
        const roleMatches = roles.some(r => r.role_name.toLowerCase().includes(q) || r.role_description.toLowerCase().includes(q));
        if (!roleMatches) return false;
      }
    }

    const rolesInCall = castingRoles.filter(r => r.casting_call_id === call.id);

    // Saved only filter
    if (savedOnly && !savedCastingIds.includes(call.id)) {
      return false;
    }

    // District filter
    if (districtFilter !== 'all') {
      const matchLoc = rolesInCall.some(r => (r.shoot_location || '').toLowerCase().includes(districtFilter.toLowerCase()));
      if (!matchLoc) return false;
    }

    // Gender filter
    if (genderFilter !== 'all') {
      const matchGender = rolesInCall.some(r => r.gender_requirement === genderFilter || r.gender_requirement === 'any');
      if (!matchGender) return false;
    }

    // Paid status filter
    if (paidOnly) {
      const hasPaid = rolesInCall.some(r => r.paid_status === 'paid');
      if (!hasPaid) return false;
    }

    // Smart Match Score Threshold filter (if talent logged in)
    if (currentTalent && matchThreshold > 0) {
      const hasQualifiedRole = rolesInCall.some(r => {
        const score = calculateRoleMatchScore(r, currentTalent).totalScore;
        return score >= matchThreshold;
      });
      if (!hasQualifiedRole) return false;
    }

    return true;
  });

  const handleResetFilters = () => {
    setSearch('');
    setDistrictFilter('all');
    setGenderFilter('all');
    setCategoryFilter('all');
    setMatchThreshold(0);
    setPaidOnly(false);
    setSavedOnly(false);
  };

  const handleApplyClick = (role: CastingRole) => {
    setApplyRole(role);
    setIsApplyOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
            Mollywood Audition Board
          </span>
          <h1 className="text-3xl font-extrabold text-white font-cinematic tracking-tight">
            Active Casting Calls
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Official casting calls from registered Malayalam producers, directors, and casting directors.
          </p>
        </div>

        {currentUser?.role === 'production' && (
          <Link
            to="/production/casting/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all shrink-0 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Casting Call</span>
          </Link>
        )}
      </div>

      {/* Talent Match Intelligence Banner if talent user */}
      {currentTalent && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 via-black to-[#0d0e14] border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">
                Smart Match Engine Active ({currentTalent.stage_name || currentTalent.user?.full_name})
              </span>
              <span className="text-zinc-400 text-[11px]">
                Matching against your Playing Age ({currentTalent.playing_age_min}–{currentTalent.playing_age_max}), {currentTalent.district || currentTalent.user?.district || 'Kerala'}, and {(currentTalent.languages || []).join(', ')}.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setMatchThreshold(matchThreshold === 70 ? 0 : 70)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                matchThreshold === 70
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {matchThreshold === 70 ? '✓ Showing 70%+ Matches' : 'Filter 70%+ Best Matches'}
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Controls Bar */}
      <div className="p-5 rounded-2xl bg-[#0c0d12] border border-amber-500/20 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-amber-400/70 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search title, role or banner..."
              className="w-full bg-black/60 border border-amber-500/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/70"
            />
          </div>

          {/* District Filter */}
          <div>
            <select
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              className="w-full bg-black/60 border border-amber-500/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400/70"
            >
              <option value="all">All Districts (Kerala)</option>
              {KERALA_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Gender Requirement */}
          <div>
            <select
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
              className="w-full bg-black/60 border border-amber-500/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400/70"
            >
              <option value="all">Gender Requirement: Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non_binary">Non-Binary</option>
            </select>
          </div>

          {/* Quick Options */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={paidOnly}
                onChange={e => setPaidOnly(e.target.checked)}
                className="rounded border-amber-500/30 bg-zinc-800 text-amber-500 focus:ring-0"
              />
              <span>Paid Only</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={savedOnly}
                onChange={e => setSavedOnly(e.target.checked)}
                className="rounded border-amber-500/40 bg-zinc-800 text-amber-500 focus:ring-0"
              />
              <Heart className={`w-3.5 h-3.5 ${savedOnly ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
              <span>Saved ({savedCastingIds.length})</span>
            </label>

            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="ml-auto text-xs text-zinc-400 hover:text-amber-300 flex items-center gap-1 p-1.5 hover:bg-white/5 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Count & Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Showing {filteredCalls.length} casting notices</span>
          <span className="text-amber-400/90 font-medium">Zero audition charges guaranteed</span>
        </div>

        {filteredCalls.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-2xl bg-[#0c0d12] border border-amber-500/20 space-y-3">
            <Building2 className="w-12 h-12 text-amber-500/30 mx-auto" />
            <h3 className="text-lg font-bold text-white">No casting calls match these criteria</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Try adjusting your district, gender, or match filters to discover more open auditions.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 text-xs font-bold shadow-md"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCalls.map(call => (
              <CastingCard
                key={call.id}
                castingCall={call}
                onApplyClick={handleApplyClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        role={applyRole}
        castingCall={castingCalls.find(c => c.id === applyRole?.casting_call_id)}
      />

      {/* Match Breakdown Modal */}
      <MatchBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        role={breakdownRole}
        talent={currentTalent}
      />
    </div>
  );
};

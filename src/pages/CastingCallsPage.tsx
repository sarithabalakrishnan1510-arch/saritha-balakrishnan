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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-1">
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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Casting Call</span>
          </Link>
        )}
      </div>

      {/* Talent Match Intelligence Banner if talent user */}
      {currentTalent && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-black to-zinc-900 border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-rose-400 shrink-0" />
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                matchThreshold === 70
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {matchThreshold === 70 ? '✓ Showing 70%+ Matches' : 'Filter 70%+ Best Matches'}
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Controls Bar */}
      <div className="p-5 rounded-2xl bg-[#111319] border border-white/10 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search title, role or banner..."
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* District Filter */}
          <div>
            <select
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
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
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
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
                className="rounded border-white/20 bg-zinc-800 text-rose-600 focus:ring-0"
              />
              <span>Paid Only</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-rose-400 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={savedOnly}
                onChange={e => setSavedOnly(e.target.checked)}
                className="rounded border-rose-500/30 bg-zinc-800 text-rose-600 focus:ring-0"
              />
              <Heart className={`w-3.5 h-3.5 ${savedOnly ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>Saved ({savedCastingIds.length})</span>
            </label>

            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="ml-auto text-xs text-zinc-400 hover:text-white flex items-center gap-1 p-1.5 hover:bg-white/5 rounded-lg"
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
          <span>Zero audition charges guaranteed</span>
        </div>

        {filteredCalls.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-2xl bg-black/30 border border-white/5 space-y-3">
            <Building2 className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No casting calls match these criteria</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Try adjusting your district, gender, or match filters to discover more open auditions.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold"
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

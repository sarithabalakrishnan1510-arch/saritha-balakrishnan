import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  Users, 
  RotateCcw,
  Video,
  Bookmark
} from 'lucide-react';
import { useApp } from '../lib/store/appStore';
import { TalentCard } from '../components/talent/TalentCard';
import { TalentProfile } from '../types';
import { KERALA_DISTRICTS, TALENT_CATEGORIES } from '../lib/constants';

export const TalentRegistryPage: React.FC = () => {
  const { talents, shortlists, createShortlist, toggleShortlistTalent, currentUser } = useApp();

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
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [childArtistsOnly, setChildArtistsOnly] = useState(false);
  const [selectedAgeMin, setSelectedAgeMin] = useState<number>(0);
  const [selectedAgeMax, setSelectedAgeMax] = useState<number>(80);

  // Active Shortlist for quick toggling
  const activeShortlist = shortlists[0] || null;

  const handleToggleShortlist = (talent: TalentProfile) => {
    if (!currentUser || currentUser.role !== 'production') return;
    if (activeShortlist) {
      toggleShortlistTalent(activeShortlist.id, talent.user_id);
    } else {
      createShortlist('General Talent Shortlist', [talent.user_id]);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDistrictFilter('all');
    setGenderFilter('all');
    setCategoryFilter('all');
    setVerifiedOnly(false);
    setChildArtistsOnly(false);
    setSelectedAgeMin(0);
    setSelectedAgeMax(80);
  };

  // Filter talents
  const filteredTalents = talents.filter(t => {
    // Only approved talents
    if (currentUser?.role !== 'admin' && t.admin_status !== 'approved') return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch =
        t.user?.full_name.toLowerCase().includes(q) ||
        (t.stage_name && t.stage_name.toLowerCase().includes(q)) ||
        (t.skills || []).some(s => s.toLowerCase().includes(q)) ||
        (t.languages || []).some(l => l.toLowerCase().includes(q)) ||
        t.bio?.toLowerCase().includes(q);
      if (!nameMatch) return false;
    }

    // District filter
    if (districtFilter !== 'all' && t.district !== districtFilter) return false;

    // Gender filter
    if (genderFilter !== 'all' && t.gender !== genderFilter) return false;

    // Category filter
    if (categoryFilter !== 'all' && t.primary_category !== categoryFilter) return false;

    // Verified only
    if (verifiedOnly && t.verification_status !== 'verified') return false;

    // Child artists only
    if (childArtistsOnly && !t.is_child_artist) return false;

    // Age range overlap
    if (t.playing_age_max < selectedAgeMin || t.playing_age_min > selectedAgeMax) return false;

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-1">
            Mollywood Casting Directory
          </span>
          <h1 className="text-3xl font-extrabold text-white font-cinematic tracking-tight">
            Kerala Talent Registry
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Browse verified actors, theatre practitioners, voice talents, and child artists across 14 Kerala districts.
          </p>
        </div>

        {currentUser?.role === 'production' && activeShortlist && (
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>Active Shortlist: <strong>{activeShortlist.name}</strong> ({activeShortlist.talent_ids.length} talents)</span>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="p-5 rounded-2xl bg-[#111319] border border-white/10 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword search */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search stage name, skills, dialect..."
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* District filter */}
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

          {/* Primary category */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Categories</option>
              {TALENT_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <select
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              <option value="all">Gender: Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non_binary">Non-Binary</option>
            </select>
          </div>
        </div>

        {/* Second row toggles & range */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5 text-xs text-zinc-300">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={e => setVerifiedOnly(e.target.checked)}
                className="rounded border-white/20 bg-zinc-800 text-rose-600 focus:ring-0"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Talent Only
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={childArtistsOnly}
                onChange={e => setChildArtistsOnly(e.target.checked)}
                className="rounded border-white/20 bg-zinc-800 text-amber-600 focus:ring-0"
              />
              <span className="flex items-center gap-1 text-amber-300">
                <UserCheck className="w-3.5 h-3.5" />
                Child Artists (Minor Protection)
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-zinc-400">Playing Age: {selectedAgeMin}–{selectedAgeMax} yrs</span>
            <button
              onClick={handleResetFilters}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 p-1 hover:bg-white/5 rounded"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Talent Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Displaying {filteredTalents.length} verified actors</span>
          <span>Contact info masked for privacy</span>
        </div>

        {filteredTalents.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-2xl bg-black/30 border border-white/5 space-y-3">
            <Users className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No talent profiles match your filter criteria</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Try adjusting the playing age range, district, or category to see more profiles.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTalents.map(talent => {
              const isShortlisted = activeShortlist?.talent_ids.includes(talent.user_id);
              return (
                <TalentCard
                  key={talent.id}
                  talent={talent}
                  onToggleShortlist={handleToggleShortlist}
                  isShortlisted={isShortlisted}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

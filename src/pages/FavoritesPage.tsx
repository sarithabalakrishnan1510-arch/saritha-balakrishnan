import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Trash2, 
  MapPin, 
  Building2, 
  Users, 
  Zap, 
  Moon, 
  Share2, 
  ExternalLink, 
  Calendar, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  FileEdit, 
  Check, 
  X, 
  ArrowRight,
  Filter,
  Film,
  Camera,
  Car,
  Landmark,
  Layers,
  Phone,
  Eye,
  FileDown
} from 'lucide-react';
import { useFavorites } from '../lib/store/favoritesStore';
import { useApp } from '../lib/store/appStore';
import { useLocationReviews } from '../lib/store/locationReviewsStore';
import { downloadLocationBookingPdf } from '../lib/utils/exportLocationPdf';
import { CastingCard } from '../components/casting/CastingCard';
import { ApplyModal } from '../components/casting/ApplyModal';
import { LocationBookingModal } from '../components/locations/LocationBookingModal';
import { ShareButton } from '../components/common/ShareButton';
import { CastingRole, ShootingLocation } from '../types';

export const FavoritesPage: React.FC = () => {
  const { 
    savedCastingIds, 
    savedLocationIds, 
    notes, 
    setFavoriteNote, 
    removeFavoriteCasting, 
    removeFavoriteLocation, 
    clearAllFavorites,
    castingCount,
    locationCount,
    totalCount
  } = useFavorites();

  const { castingCalls, locations, currentUser, currentProduction, projects, notifications } = useApp();
  const { getLocationRatingSummary } = useLocationReviews();

  const [activeTab, setActiveTab] = useState<'all' | 'casting' | 'locations'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [quickExportingId, setQuickExportingId] = useState<string | null>(null);

  const handleQuickExportPdf = (loc: ShootingLocation) => {
    setQuickExportingId(loc.id);
    try {
      const ratingSummary = getLocationRatingSummary(loc.id);
      downloadLocationBookingPdf({
        location: loc,
        projectTitle: projects[0]?.name,
        productionCompany: currentProduction?.company_name || (currentUser?.full_name ? `${currentUser.full_name} Productions` : undefined),
        lineProducerName: currentUser?.full_name,
        ratingAverage: ratingSummary.reviewCount > 0 ? ratingSummary.averageRating : undefined,
        reviewCount: ratingSummary.reviewCount > 0 ? ratingSummary.reviewCount : undefined
      });
    } catch (err) {
      console.error('Quick export error', err);
    } finally {
      setTimeout(() => setQuickExportingId(null), 800);
    }
  };

  // Modals for application and booking
  const [applyRole, setApplyRole] = useState<CastingRole | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedLocationForInquiry, setSelectedLocationForInquiry] = useState<ShootingLocation | null>(null);

  // Resolved list of saved casting calls
  const savedCalls = useMemo(() => {
    return castingCalls.filter(call => savedCastingIds.includes(call.id));
  }, [castingCalls, savedCastingIds]);

  // Resolved list of saved locations
  const savedLocs = useMemo(() => {
    return locations.filter(loc => savedLocationIds.includes(loc.id));
  }, [locations, savedLocationIds]);

  // Filtered lists based on search
  const filteredCalls = useMemo(() => {
    if (!searchQuery.trim()) return savedCalls;
    const q = searchQuery.toLowerCase();
    return savedCalls.filter(c => 
      c.title.toLowerCase().includes(q) ||
      c.company_name?.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (notes[c.id] && notes[c.id].toLowerCase().includes(q))
    );
  }, [savedCalls, searchQuery, notes]);

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return savedLocs;
    const q = searchQuery.toLowerCase();
    return savedLocs.filter(l => 
      l.title.toLowerCase().includes(q) ||
      l.district.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) ||
      l.category_name.toLowerCase().includes(q) ||
      (notes[l.id] && notes[l.id].toLowerCase().includes(q))
    );
  }, [savedLocs, searchQuery, notes]);

  const handleStartEditNote = (id: string) => {
    setEditingNoteId(id);
    setTempNote(notes[id] || '');
  };

  const handleSaveNote = (id: string) => {
    setFavoriteNote(id, tempNote);
    setEditingNoteId(null);
  };

  const handleShareFavorites = () => {
    const lines: string[] = [
      '🎬 My Cast Kerala Personal List:',
      '',
      `📌 SAVED CASTING CALLS (${savedCalls.length}):`,
      ...savedCalls.map(c => `- ${c.title} by ${c.company_name || 'Production'} (Deadline: ${new Date(c.application_deadline).toLocaleDateString()})${notes[c.id] ? ` [Note: ${notes[c.id]}]` : ''}`),
      '',
      `📍 SAVED SHOOTING LOCATIONS (${savedLocs.length}):`,
      ...savedLocs.map(l => `- ${l.title} (${l.city}, ${l.district}) - ${l.pricing_text}${notes[l.id] ? ` [Note: ${notes[l.id]}]` : ''}`),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Heart className="w-4 h-4 fill-amber-400 text-amber-400" />
            </span>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Personal Shortlist & Vault
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-cinematic tracking-tight">
            My Saved Auditions & Shooting Locations
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Persistent offline-first bookmarks stored securely in your browser. Track dream audition roles, compare heritage Nalukettus, and attach private production notes.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {totalCount > 0 && (
            <>
              <button
                onClick={handleShareFavorites}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-amber-500/20 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
                title="Copy formatted list to clipboard"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{copiedSummary ? 'List Copied!' : 'Export List'}</span>
              </button>

              <button
                onClick={() => setConfirmClearOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2 transition-colors"
                title="Remove all saved favorites"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'all'
              ? 'bg-[#151722] border-amber-500/50 shadow-lg shadow-amber-950/20'
              : 'bg-[#0d0e14] border-white/10 hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Total Bookmarks</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-cinematic">{totalCount}</span>
            <span className="text-[11px] text-zinc-500">items in vault</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('casting')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'casting'
              ? 'bg-[#151722] border-amber-500/50 shadow-lg shadow-amber-950/20'
              : 'bg-[#0d0e14] border-white/10 hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Saved Casting Calls</span>
            <Film className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 font-cinematic">{castingCount}</span>
            <span className="text-[11px] text-zinc-500">audition notices</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('locations')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'locations'
              ? 'bg-[#151722] border-amber-500/50 shadow-lg shadow-amber-950/20'
              : 'bg-[#0d0e14] border-white/10 hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Saved Shooting Locations</span>
            <Camera className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-yellow-400 font-cinematic">{locationCount}</span>
            <span className="text-[11px] text-zinc-500">scouted venues</span>
          </div>
        </button>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Segmented Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0d0e14] border border-amber-500/20 self-start">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Items ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('casting')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'casting'
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Film className="w-3 h-3" />
            <span>Casting ({castingCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'locations'
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Camera className="w-3 h-3" />
            <span>Locations ({locationCount})</span>
          </button>
        </div>

        {/* In-Vault Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search saved titles, locations, notes..."
            className="w-full bg-[#0d0e14] border border-amber-500/20 hover:border-amber-500/40 focus:border-amber-400 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-zinc-500 hover:text-white p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Empty State when NO favorites saved */}
      {totalCount === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0d0e14] border border-amber-500/20 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <Heart className="w-8 h-8 text-amber-400 fill-amber-400" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white font-cinematic">
              Your Personal List is Empty
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tap the heart icon on any Casting Call or Shooting Location to save it here for fast access and side-by-side comparison.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/casting"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md hover:scale-[1.02]"
            >
              <Film className="w-4 h-4" />
              <span>Browse Casting Calls</span>
            </Link>
            <Link
              to="/locations"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-amber-500/20 text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Scout Shooting Locations</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* SECTION 1: CASTING CALLS */}
          {(activeTab === 'all' || activeTab === 'casting') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  <h2 className="text-base font-bold text-white font-cinematic">
                    Saved Casting Calls ({filteredCalls.length})
                  </h2>
                </div>
                <Link
                  to="/casting"
                  className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <span>Explore more casting</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {filteredCalls.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#0d0e14] border border-amber-500/10 text-zinc-400 text-xs">
                  {castingCount === 0
                    ? 'No casting calls saved yet. Tap the heart icon on any audition notice.'
                    : 'No saved casting calls match your search query.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCalls.map(call => {
                    const isNoteEditing = editingNoteId === call.id;
                    const callNote = notes[call.id];

                    return (
                      <div
                        key={call.id}
                        className="rounded-2xl bg-[#0d0e14] border border-amber-500/20 hover:border-amber-500/40 transition-all overflow-hidden flex flex-col justify-between shadow-xl"
                      >
                        <div className="p-5 space-y-4">
                          {/* Header bar with remove and full details */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                <Building2 className="w-3 h-3" />
                                {call.company_name || 'Production House'}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <ShieldCheck className="w-3 h-3" />
                                Verified
                              </span>
                            </div>

                            <button
                              onClick={() => removeFavoriteCasting(call.id)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 transition-colors border border-white/5"
                              title="Remove from saved list"
                            >
                              <Heart className="w-4 h-4 fill-amber-400 text-amber-400 hover:opacity-75" />
                            </button>
                          </div>

                          {/* Title */}
                          <Link
                            to={`/casting/${call.id}`}
                            className="block group"
                          >
                            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                              {call.title}
                            </h3>
                          </Link>

                          <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                            {call.description}
                          </p>

                          {/* Deadline & Location info */}
                          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-white/5">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                              <span>Deadline: </span>
                              <span className="text-zinc-200 font-medium">
                                {new Date(call.application_deadline).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <Link
                              to={`/casting/${call.id}`}
                              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-0.5"
                            >
                              <span>View Notice</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>

                          {/* Personal Note Box */}
                          <div className="p-3 rounded-xl bg-black/40 border border-amber-500/15 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-[10px] text-zinc-400">
                              <span className="font-semibold text-amber-300 flex items-center gap-1">
                                <FileEdit className="w-3 h-3" />
                                Personal Audition Note
                              </span>
                              {!isNoteEditing && (
                                <button
                                  onClick={() => handleStartEditNote(call.id)}
                                  className="text-zinc-400 hover:text-white"
                                >
                                  {callNote ? 'Edit' : '+ Add Note'}
                                </button>
                              )}
                            </div>

                            {isNoteEditing ? (
                              <div className="space-y-2 pt-1">
                                <textarea
                                  rows={2}
                                  value={tempNote}
                                  onChange={e => setTempNote(e.target.value)}
                                  placeholder="e.g. Prepare 2-minute Malayalam monologue; shoot in Kochi..."
                                  className="w-full bg-black/60 border border-amber-500/40 rounded-lg p-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                                />
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => setEditingNoteId(null)}
                                    className="px-2 py-1 rounded text-[10px] text-zinc-400 hover:text-white"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveNote(call.id)}
                                    className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[10px] font-bold flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[11px] text-zinc-300 italic">
                                {callNote || 'No private notes attached yet. Click "+ Add Note" to log self-tape links or prep details.'}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Footer button */}
                        <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[11px] text-zinc-500">Quick Audition Flow</span>
                          <Link
                            to={`/casting/${call.id}`}
                            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold text-xs transition-colors shadow"
                          >
                            Apply for Roles
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: SHOOTING LOCATIONS */}
          {(activeTab === 'all' || activeTab === 'locations') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <h2 className="text-base font-bold text-white font-cinematic">
                    Saved Shooting Locations ({filteredLocations.length})
                  </h2>
                </div>
                <Link
                  to="/locations"
                  className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <span>Explore more venues</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {filteredLocations.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#0d0e14] border border-amber-500/10 text-zinc-400 text-xs">
                  {locationCount === 0
                    ? 'No shooting locations saved yet. Tap the heart icon on any property in the Nalukettu Registry.'
                    : 'No saved locations match your search query.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredLocations.map(loc => {
                    const isNoteEditing = editingNoteId === loc.id;
                    const locNote = notes[loc.id];
                    const activeBookingNotif = notifications.find(
                      n => (n.entity_id === loc.id || n.location_id === loc.id) &&
                           (n.type === 'location_booking_confirmed' || n.type === 'location_booking_update' || n.type === 'location_saved_update')
                    );

                    return (
                      <div
                        key={loc.id}
                        className="rounded-2xl bg-[#0d0e14] border border-amber-500/20 hover:border-amber-500/40 transition-all overflow-hidden flex flex-col justify-between shadow-xl"
                      >
                        <div>
                          {/* Image with overlay badge & Favorite toggle */}
                          <Link 
                            to={`/locations?location=${loc.id}`}
                            className="h-52 w-full relative overflow-hidden bg-zinc-900 block group"
                            title={`View photo gallery and specs for ${loc.title}`}
                          >
                            <img
                              src={loc.image_urls[0] || 'https://images.unsplash.com/photo-1590059390047-5a02e6462444?w=800&fit=crop'}
                              alt={loc.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                            {/* Top Left Badges */}
                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-zinc-200 backdrop-blur-md border border-white/10">
                                {loc.category_name}
                              </span>
                              {loc.verification_status === 'verified' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/70 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" />
                                  Verified
                                </span>
                              )}
                            </div>

                            {/* Top Right: Share Button & Favorite Unsave Button */}
                            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                              <ShareButton
                                title={loc.title}
                                url={`/locations?location=${loc.id}`}
                                description={`${loc.title} in ${loc.city}, ${loc.district} District - ${loc.pricing_text}`}
                                type="location"
                                variant="icon"
                                size="sm"
                                className="p-1.5 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-white"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeFavoriteLocation(loc.id);
                                }}
                                className="p-2 rounded-full bg-black/70 hover:bg-amber-500/20 text-amber-400 transition-colors backdrop-blur-md border border-white/15"
                                title="Remove location from favorites"
                              >
                                <Heart className="w-4 h-4 fill-amber-400 text-amber-400" />
                              </button>
                            </div>

                            {/* Bottom Left Photo Count Badge */}
                            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-10">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/80 text-amber-300 border border-amber-500/30 backdrop-blur-sm flex items-center gap-1">
                                <Camera className="w-3 h-3 text-amber-400" />
                                {loc.image_urls.length} {loc.image_urls.length === 1 ? 'Photo' : 'Photos'}
                              </span>
                            </div>

                            {/* Bottom Right Daily Shift Rate */}
                            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-xs font-bold text-amber-300 border border-amber-500/30 z-10">
                              {loc.pricing_text}
                            </div>
                          </Link>

                          {/* Active Location Booking Alert Banner */}
                          {activeBookingNotif && (
                            <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
                              <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-amber-300 text-[11px] uppercase tracking-wider">
                                    {activeBookingNotif.booking_status === 'caretaker_approved' 
                                      ? 'Caretaker Approved' 
                                      : activeBookingNotif.booking_status === 'permit_cleared' 
                                      ? 'Night Permit Cleared' 
                                      : 'Booking Update'}
                                  </span>
                                  {activeBookingNotif.booking_ref && (
                                    <span className="text-[10px] font-mono text-zinc-400 bg-black/40 px-1 py-0.5 rounded">
                                      {activeBookingNotif.booking_ref}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug line-clamp-2">
                                  {activeBookingNotif.body}
                                </p>
                                {activeBookingNotif.shift_dates && (
                                  <div className="text-[10px] text-amber-200/80 mt-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-amber-400" />
                                    <span>{activeBookingNotif.shift_dates}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Body Details */}
                          <div className="p-5 space-y-3 text-xs">
                            <div>
                              <Link to={`/locations?location=${loc.id}`}>
                                <h3 className="text-base font-bold text-white hover:text-amber-300 transition-colors leading-snug">
                                  {loc.title}
                                </h3>
                              </Link>
                              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>{loc.city}, {loc.district} District</span>
                              </div>
                            </div>

                            <p className="text-zinc-300 text-xs leading-relaxed line-clamp-2">
                              {loc.description}
                            </p>

                            {/* Technical Clearance Stats */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px] text-zinc-400">
                              <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-zinc-500" />
                                <span>Crew: {loc.crew_capacity} pax</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Car className="w-3.5 h-3.5 text-zinc-500" />
                                <span>Parking: {loc.parking_capacity} units</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-amber-400" />
                                <span>Gen: {loc.generator_access ? 'Available' : 'None'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Moon className="w-3.5 h-3.5 text-yellow-400" />
                                <span>Night: {loc.night_shoot_allowed ? 'Allowed' : 'Day Only'}</span>
                              </div>
                            </div>

                            {/* Personal Location Note Box */}
                            <div className="p-3 rounded-xl bg-black/40 border border-amber-500/15 space-y-1.5 text-xs mt-2">
                              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                                <span className="font-semibold text-amber-300 flex items-center gap-1">
                                  <FileEdit className="w-3 h-3" />
                                  Personal Scouting Note
                                </span>
                                {!isNoteEditing && (
                                  <button
                                    onClick={() => handleStartEditNote(loc.id)}
                                    className="text-zinc-400 hover:text-white"
                                  >
                                    {locNote ? 'Edit' : '+ Add Note'}
                                  </button>
                                )}
                              </div>

                              {isNoteEditing ? (
                                <div className="space-y-2 pt-1">
                                  <textarea
                                    rows={2}
                                    value={tempNote}
                                    onChange={e => setTempNote(e.target.value)}
                                    placeholder="e.g. Discuss 3-day rental bundle with manager for October schedule..."
                                    className="w-full bg-black/60 border border-amber-500/40 rounded-lg p-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                                  />
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={() => setEditingNoteId(null)}
                                      className="px-2 py-1 rounded text-[10px] text-zinc-400 hover:text-white"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleSaveNote(loc.id)}
                                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[10px] font-bold flex items-center gap-1"
                                    >
                                      <Check className="w-3 h-3" />
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[11px] text-zinc-300 italic">
                                  {locNote || 'No private scouting notes attached yet. Click "+ Add Note" to log phone notes or shoot ideas.'}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer with Liaison Button, PDF Export, and Gallery Link */}
                        <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/locations?location=${loc.id}`}
                              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 font-medium text-xs transition-colors flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-400" />
                              <span>Scout Photos</span>
                            </Link>
                            <ShareButton
                              title={loc.title}
                              url={`/locations?location=${loc.id}`}
                              description={`${loc.title} in ${loc.city}, ${loc.district}`}
                              type="location"
                              variant="card-action"
                              label="Share"
                              className="px-2.5 py-1.5"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              id={`export-fav-pdf-${loc.id}`}
                              type="button"
                              onClick={() => handleQuickExportPdf(loc)}
                              disabled={quickExportingId === loc.id}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/30 font-medium text-xs transition-colors flex items-center gap-1 active:scale-95 disabled:opacity-50"
                              title="Export location booking details into a formatted PDF for production planning"
                            >
                              <FileDown className="w-3.5 h-3.5 text-amber-400" />
                              <span className="hidden sm:inline text-[11px]">{quickExportingId === loc.id ? 'Exporting...' : 'PDF'}</span>
                            </button>

                            <button
                              onClick={() => setSelectedLocationForInquiry(loc)}
                              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold text-xs transition-colors shadow flex items-center gap-1.5 active:scale-95"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Plan / Book</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#0d0e14] border border-amber-500/30 p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-base font-bold font-cinematic">Clear All Saved Items?</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This will remove all {totalCount} saved casting calls and shooting locations from your browser's local storage. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllFavorites();
                  setConfirmClearOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Booking & Production Planning Modal */}
      <LocationBookingModal
        location={selectedLocationForInquiry}
        isOpen={!!selectedLocationForInquiry}
        onClose={() => setSelectedLocationForInquiry(null)}
      />
    </div>
  );
};

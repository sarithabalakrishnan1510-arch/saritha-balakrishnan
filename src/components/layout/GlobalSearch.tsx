import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  User, 
  Clapperboard, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Baby, 
  Film,
  Building2,
  CornerDownLeft,
  ChevronRight,
  Newspaper
} from 'lucide-react';
import { useApp } from '../../lib/store/appStore';
import { TalentProfile, CastingCall, ShootingLocation } from '../../types';
import { getStoredUpdates } from '../../lib/services/industryUpdatesService';

interface GlobalSearchProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  className?: string;
}

type SearchCategory = 'all' | 'talent' | 'casting' | 'locations' | 'news';

interface SearchResultItem {
  id: string;
  type: 'talent' | 'casting' | 'location' | 'news';
  title: string;
  subtitle: string;
  badge: string;
  secondaryBadge?: string;
  location?: string;
  imageUrl?: string;
  url: string;
  extraInfo?: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ 
  isOpenMobile = false, 
  onCloseMobile,
  className = ''
}) => {
  const navigate = useNavigate();
  const { talents, castingCalls, castingRoles, locations, currentUser } = useApp();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcut: Cmd+K / Ctrl+K or / to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        if (onCloseMobile) onCloseMobile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCloseMobile]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items based on query
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { 
        talents: [] as SearchResultItem[], 
        castingCalls: [] as SearchResultItem[], 
        locations: [] as SearchResultItem[], 
        news: [] as SearchResultItem[], 
        allItems: [] as SearchResultItem[] 
      };
    }

    // 1. Filter Talents
    const matchedTalents: SearchResultItem[] = talents
      .filter(t => {
        if (currentUser?.role !== 'admin' && t.admin_status !== 'approved') return false;
        const name = (t.user?.full_name || '').toLowerCase();
        const stageName = (t.stage_name || '').toLowerCase();
        const category = (t.primary_category || '').toLowerCase();
        const skills = (t.skills || []).map(s => s.toLowerCase()).join(' ');
        const languages = (t.languages || []).map(l => l.toLowerCase()).join(' ');
        const district = (t.district || t.user?.district || '').toLowerCase();
        const city = (t.city || t.user?.city || '').toLowerCase();
        const bio = (t.bio || '').toLowerCase();

        return (
          name.includes(q) ||
          stageName.includes(q) ||
          category.includes(q) ||
          skills.includes(q) ||
          languages.includes(q) ||
          district.includes(q) ||
          city.includes(q) ||
          bio.includes(q)
        );
      })
      .slice(0, 8)
      .map(t => {
        const displayName = t.stage_name || t.user?.full_name || 'Artist';
        const primaryPhoto = t.media?.find(m => m.is_primary)?.media_url || t.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&fit=crop';
        const locationStr = `${t.city || t.user?.city || 'Kerala'}, ${t.district || t.user?.district || ''}`.trim().replace(/^,\s*|,\s*$/g, '');
        
        return {
          id: t.id,
          type: 'talent' as const,
          title: displayName,
          subtitle: `${t.primary_category} • Age ${t.actual_age || `${t.playing_age_min}-${t.playing_age_max}`}`,
          badge: t.is_child_artist ? 'Child Artist' : t.primary_category,
          secondaryBadge: t.verification_status === 'verified' ? 'Verified' : undefined,
          location: locationStr,
          imageUrl: primaryPhoto,
          url: `/talent/${t.id}`,
          extraInfo: (t.skills && t.skills.length > 0) ? `Skills: ${t.skills.slice(0, 3).join(', ')}` : undefined
        };
      });

    // 2. Filter Casting Calls
    const matchedCasting: SearchResultItem[] = castingCalls
      .filter(call => {
        if (currentUser?.role !== 'admin' && call.status !== 'published') return false;
        const title = (call.title || '').toLowerCase();
        const desc = (call.description || '').toLowerCase();
        const company = (call.company_name || call.project?.production_house || '').toLowerCase();
        const projectName = (call.project?.name || '').toLowerCase();
        const director = (call.project?.director_name || '').toLowerCase();
        
        // Match roles inside call
        const roles = castingRoles.filter(r => r.casting_call_id === call.id);
        const rolesText = roles.map(r => `${r.role_name} ${r.role_description} ${r.gender_requirement} ${r.shoot_location || ''} ${(r.language_requirement || []).join(' ')}`).join(' ').toLowerCase();

        return (
          title.includes(q) ||
          desc.includes(q) ||
          company.includes(q) ||
          projectName.includes(q) ||
          director.includes(q) ||
          rolesText.includes(q)
        );
      })
      .slice(0, 8)
      .map(c => {
        const roles = castingRoles.filter(r => r.casting_call_id === c.id);
        const company = c.company_name || c.project?.production_house || 'Production';
        const roleNames = roles.map(r => r.role_name).slice(0, 2).join(', ');
        
        return {
          id: c.id,
          type: 'casting' as const,
          title: c.title,
          subtitle: `${company} • ${roles.length} Role${roles.length === 1 ? '' : 's'}${roleNames ? `: ${roleNames}` : ''}`,
          badge: `${roles.length} Open Roles`,
          secondaryBadge: c.project?.project_type ? c.project.project_type.replace('_', ' ') : 'Feature Film',
          location: c.project?.primary_location || 'Kerala Shoot',
          url: `/casting/${c.id}`,
          extraInfo: `Deadline: ${new Date(c.application_deadline).toLocaleDateString()}`
        };
      });

    // 3. Filter Locations
    const matchedLocations: SearchResultItem[] = locations
      .filter(loc => {
        const title = (loc.title || '').toLowerCase();
        const category = (loc.category_name || '').toLowerCase();
        const district = (loc.district || '').toLowerCase();
        const city = (loc.city || '').toLowerCase();
        const desc = (loc.description || '').toLowerCase();
        const pricing = (loc.pricing_text || '').toLowerCase();

        return (
          title.includes(q) ||
          category.includes(q) ||
          district.includes(q) ||
          city.includes(q) ||
          desc.includes(q) ||
          pricing.includes(q)
        );
      })
      .slice(0, 8)
      .map(loc => {
        return {
          id: loc.id,
          type: 'location' as const,
          title: loc.title,
          subtitle: `${loc.category_name} • ${loc.pricing_text}`,
          badge: loc.category_name,
          location: `${loc.city}, ${loc.district}`,
          imageUrl: loc.image_urls[0] || 'https://images.unsplash.com/photo-1590059390047-5a02e6462444?w=400&fit=crop',
          url: `/locations?search=${encodeURIComponent(loc.title)}`,
          extraInfo: loc.night_shoot_allowed ? 'Night shoot permitted' : undefined
        };
      });

    // 4. Filter Industry News & Circulars
    const allUpdates = getStoredUpdates();
    const matchedNews: SearchResultItem[] = allUpdates
      .filter(u => {
        const title = (u.title || '').toLowerCase();
        const summary = (u.summary || '').toLowerCase();
        const org = (u.source_organization || '').toLowerCase();
        const ref = (u.official_reference_no || '').toLowerCase();
        const tags = (u.tags || []).map(t => t.toLowerCase()).join(' ');

        return (
          title.includes(q) ||
          summary.includes(q) ||
          org.includes(q) ||
          ref.includes(q) ||
          tags.includes(q)
        );
      })
      .slice(0, 8)
      .map(u => {
        return {
          id: u.id,
          type: 'news' as const,
          title: u.title,
          subtitle: `${u.source_organization_short} • Ref: ${u.official_reference_no}`,
          badge: u.source_organization_short,
          secondaryBadge: u.urgent ? 'Statutory' : undefined,
          imageUrl: u.image_url,
          url: `/?update=${u.id}#industry-updates`,
          extraInfo: `Published ${u.published_relative}`
        };
      });

    let allItems: SearchResultItem[] = [];
    if (selectedCategory === 'all') {
      allItems = [
        ...matchedNews.slice(0, 3),
        ...matchedTalents.slice(0, 3), 
        ...matchedCasting.slice(0, 3), 
        ...matchedLocations.slice(0, 3)
      ];
    } else if (selectedCategory === 'talent') {
      allItems = matchedTalents;
    } else if (selectedCategory === 'casting') {
      allItems = matchedCasting;
    } else if (selectedCategory === 'locations') {
      allItems = matchedLocations;
    } else if (selectedCategory === 'news') {
      allItems = matchedNews;
    }

    return {
      talents: matchedTalents,
      castingCalls: matchedCasting,
      locations: matchedLocations,
      news: matchedNews,
      allItems
    };
  }, [query, selectedCategory, talents, castingCalls, castingRoles, locations, currentUser]);

  const totalCount = 
    filteredResults.talents.length + 
    filteredResults.castingCalls.length + 
    filteredResults.locations.length + 
    filteredResults.news.length;

  // Handle keyboard navigation inside search list
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    const items = filteredResults.allItems;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        handleSelectItem(items[selectedIndex]);
      } else if (query.trim()) {
        // Navigate to the current category view with search query
        handleViewAll(selectedCategory);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      if (onCloseMobile) onCloseMobile();
    }
  };

  const handleSelectItem = (item: SearchResultItem) => {
    navigate(item.url);
    setIsOpen(false);
    setQuery('');
    if (onCloseMobile) onCloseMobile();
  };

  const handleViewAll = (category: SearchCategory) => {
    const encoded = encodeURIComponent(query.trim());
    if (category === 'talent') {
      navigate(`/talent?q=${encoded}`);
    } else if (category === 'casting') {
      navigate(`/casting?q=${encoded}`);
    } else if (category === 'locations') {
      navigate(`/locations?q=${encoded}`);
    } else {
      // Default to casting or talent based on results count
      if (filteredResults.castingCalls.length > 0) {
        navigate(`/casting?q=${encoded}`);
      } else if (filteredResults.talents.length > 0) {
        navigate(`/talent?q=${encoded}`);
      } else {
        navigate(`/locations?q=${encoded}`);
      }
    }
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
  };

  const popularKeywords = [
    { label: 'Kochi', cat: 'locations' },
    { label: 'Child Artist', cat: 'talent' },
    { label: 'Lead Actor', cat: 'talent' },
    { label: 'Action & Stunt', cat: 'talent' },
    { label: 'Thrissur Dialect', cat: 'talent' },
    { label: 'Heritage Illam', cat: 'locations' },
    { label: 'Feature Film', cat: 'casting' },
  ];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-3 pointer-events-none text-zinc-400">
          <Search className="w-4 h-4 text-zinc-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search talent, casting calls, locations..."
          className="w-full bg-[#0d0e14] hover:bg-[#141620] focus:bg-[#12141c] border border-amber-500/20 hover:border-amber-500/40 focus:border-amber-400 rounded-xl pl-9 pr-14 sm:pr-20 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-all duration-200 shadow-inner"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/10"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-amber-500/20 text-amber-400/80 font-mono select-none">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {/* Dropdown Results / Command Palette Overlay */}
      {isOpen && (
        <div 
          className="absolute left-0 right-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-[500px] md:w-[580px] max-w-[95vw] rounded-2xl bg-[#0d0e14] border border-amber-500/30 shadow-2xl z-50 overflow-hidden backdrop-blur-xl text-white animate-in fade-in zoom-in-95 duration-150"
          style={{ maxHeight: '85vh' }}
        >
          {/* Header & Category Tabs */}
          <div className="p-3 border-b border-amber-500/20 bg-black/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedIndex(-1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow-sm'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                All {query.trim() && `(${totalCount})`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('talent');
                  setSelectedIndex(-1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  selectedCategory === 'talent'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow-sm'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <User className="w-3 h-3 text-amber-400" />
                Talent {query.trim() && `(${filteredResults.talents.length})`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('casting');
                  setSelectedIndex(-1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  selectedCategory === 'casting'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow-sm'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Clapperboard className="w-3 h-3 text-amber-400" />
                Casting Calls {query.trim() && `(${filteredResults.castingCalls.length})`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('locations');
                  setSelectedIndex(-1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  selectedCategory === 'locations'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow-sm'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <MapPin className="w-3 h-3 text-amber-400" />
                Locations {query.trim() && `(${filteredResults.locations.length})`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('news');
                  setSelectedIndex(-1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  selectedCategory === 'news'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow-sm'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Newspaper className="w-3 h-3 text-yellow-400" />
                Industry Wire {query.trim() && `(${filteredResults.news.length})`}
              </button>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                if (onCloseMobile) onCloseMobile();
              }}
              className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-white/5"
              title="Close search (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div ref={listRef} className="overflow-y-auto max-h-[60vh] divide-y divide-white/5">
            {/* Empty Query: Quick Suggestions State */}
            {!query.trim() ? (
              <div className="p-5 space-y-4">
                <div>
                  <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Popular Searches</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {popularKeywords.map(item => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setQuery(item.label);
                          setSelectedCategory('all');
                          inputRef.current?.focus();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-xs text-zinc-300 hover:text-white transition-all text-left flex items-center gap-1.5"
                      >
                        <Search className="w-3 h-3 text-zinc-500" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/casting');
                      setIsOpen(false);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="p-3 rounded-xl bg-gradient-to-br from-[#1a1c26] to-[#0d0e14] border border-amber-500/20 hover:border-amber-500/40 text-left group transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Clapperboard className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-white">All Casting Calls</div>
                    <div className="text-[11px] text-zinc-400">View active Mollywood roles</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigate('/talent');
                      setIsOpen(false);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="p-3 rounded-xl bg-gradient-to-br from-[#1a1c26] to-[#0d0e14] border border-amber-500/20 hover:border-amber-500/40 text-left group transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-white">Talent Registry</div>
                    <div className="text-[11px] text-zinc-400">Search verified actors & crew</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigate('/locations');
                      setIsOpen(false);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="p-3 rounded-xl bg-gradient-to-br from-[#1a1c26] to-[#0d0e14] border border-amber-500/20 hover:border-amber-500/40 text-left group transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-yellow-500/20 text-yellow-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-white">Shooting Locations</div>
                    <div className="text-[11px] text-zinc-400">Heritage houses & estates</div>
                  </button>
                </div>
              </div>
            ) : totalCount === 0 ? (
              /* No Results State */
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">No results found for "{query}"</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Try searching by actor name, playing category, Malayalam dialect (e.g. "Thrissur"), skill (e.g. "Action", "Dubbing"), or location (e.g. "Kochi", "Palakkad").
                </p>
                <div className="pt-2 flex justify-center gap-2 text-xs">
                  <button
                    onClick={() => setQuery('')}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            ) : (
              /* Results List */
              <div className="p-2 space-y-4">
                {/* Segment 1: Talents */}
                {(selectedCategory === 'all' || selectedCategory === 'talent') && filteredResults.talents.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 py-1 text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>Talent & Artists ({filteredResults.talents.length})</span>
                      </span>
                      {filteredResults.talents.length > 4 && selectedCategory === 'all' && (
                        <button
                          onClick={() => setSelectedCategory('talent')}
                          className="text-[11px] text-amber-400 hover:text-amber-300 capitalize font-medium flex items-center gap-0.5"
                        >
                          View all {filteredResults.talents.length}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      {(selectedCategory === 'all' ? filteredResults.talents.slice(0, 4) : filteredResults.talents).map(item => {
                        const isSelected = filteredResults.allItems.indexOf(item) === selectedIndex;
                        return (
                          <div
                            key={`talent-${item.id}`}
                            onClick={() => handleSelectItem(item)}
                            className={`group p-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-3 border ${
                              isSelected
                                ? 'bg-amber-500/15 border-amber-500/40 shadow-sm'
                                : 'hover:bg-white/5 border-transparent'
                            }`}
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                                  {item.title}
                                </h4>
                                {item.secondaryBadge && (
                                  <span className="shrink-0 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-medium flex items-center gap-0.5">
                                    <ShieldCheck className="w-2.5 h-2.5" />
                                    {item.secondaryBadge}
                                  </span>
                                )}
                                {item.badge === 'Child Artist' && (
                                  <span className="shrink-0 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-medium flex items-center gap-0.5">
                                    <Baby className="w-2.5 h-2.5" />
                                    Child Artist
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-400 truncate">{item.subtitle}</p>
                              {item.extraInfo && (
                                <p className="text-[10px] text-zinc-500 truncate">{item.extraInfo}</p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-zinc-500" />
                                {item.location}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Segment 2: Casting Calls */}
                {(selectedCategory === 'all' || selectedCategory === 'casting') && filteredResults.castingCalls.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 py-1 text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clapperboard className="w-3.5 h-3.5" />
                        <span>Casting Calls ({filteredResults.castingCalls.length})</span>
                      </span>
                      {filteredResults.castingCalls.length > 4 && selectedCategory === 'all' && (
                        <button
                          onClick={() => setSelectedCategory('casting')}
                          className="text-[11px] text-amber-400 hover:text-amber-300 capitalize font-medium flex items-center gap-0.5"
                        >
                          View all {filteredResults.castingCalls.length}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      {(selectedCategory === 'all' ? filteredResults.castingCalls.slice(0, 4) : filteredResults.castingCalls).map(item => {
                        const isSelected = filteredResults.allItems.indexOf(item) === selectedIndex;
                        return (
                          <div
                            key={`casting-${item.id}`}
                            onClick={() => handleSelectItem(item)}
                            className={`group p-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-3 border ${
                              isSelected
                                ? 'bg-amber-600/15 border-amber-500/40 shadow-sm'
                                : 'hover:bg-white/5 border-transparent'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Clapperboard className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                                  {item.title}
                                </h4>
                                <span className="shrink-0 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-medium">
                                  {item.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 truncate">{item.subtitle}</p>
                              {item.extraInfo && (
                                <p className="text-[10px] text-zinc-500">{item.extraInfo}</p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-zinc-400 block">{item.location}</span>
                              <span className="text-[9px] text-zinc-500 capitalize">{item.secondaryBadge}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Segment 3: Shooting Locations */}
                {(selectedCategory === 'all' || selectedCategory === 'locations') && filteredResults.locations.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 py-1 text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Shooting Locations ({filteredResults.locations.length})</span>
                      </span>
                      {filteredResults.locations.length > 4 && selectedCategory === 'all' && (
                        <button
                          onClick={() => setSelectedCategory('locations')}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 capitalize font-medium flex items-center gap-0.5"
                        >
                          View all {filteredResults.locations.length}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      {(selectedCategory === 'all' ? filteredResults.locations.slice(0, 4) : filteredResults.locations).map(item => {
                        const isSelected = filteredResults.allItems.indexOf(item) === selectedIndex;
                        return (
                          <div
                            key={`location-${item.id}`}
                            onClick={() => handleSelectItem(item)}
                            className={`group p-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-3 border ${
                              isSelected
                                ? 'bg-emerald-600/15 border-emerald-500/40 shadow-sm'
                                : 'hover:bg-white/5 border-transparent'
                            }`}
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                                  {item.title}
                                </h4>
                                <span className="shrink-0 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                                  {item.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 truncate">{item.subtitle}</p>
                              {item.extraInfo && (
                                <p className="text-[10px] text-emerald-400/80">{item.extraInfo}</p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-zinc-500" />
                                {item.location}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Segment 4: Industry Updates & Circulars */}
                {(selectedCategory === 'all' || selectedCategory === 'news') && filteredResults.news.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 py-1 text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Newspaper className="w-3.5 h-3.5" />
                        <span>Industry Wire & Directives ({filteredResults.news.length})</span>
                      </span>
                      {filteredResults.news.length > 4 && selectedCategory === 'all' && (
                        <button
                          onClick={() => setSelectedCategory('news')}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 capitalize font-medium flex items-center gap-0.5"
                        >
                          View all {filteredResults.news.length}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      {(selectedCategory === 'all' ? filteredResults.news.slice(0, 3) : filteredResults.news).map(item => {
                        const isSelected = filteredResults.allItems.indexOf(item) === selectedIndex;
                        return (
                          <div
                            key={`news-${item.id}`}
                            onClick={() => handleSelectItem(item)}
                            className={`group p-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-3 border ${
                              isSelected
                                ? 'bg-cyan-600/15 border-cyan-500/40 shadow-sm'
                                : 'hover:bg-white/5 border-transparent'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Newspaper className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                                  {item.title}
                                </h4>
                                <span className="shrink-0 text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-medium">
                                  {item.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 truncate">{item.subtitle}</p>
                              {item.extraInfo && (
                                <p className="text-[10px] text-cyan-400/80">{item.extraInfo}</p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-zinc-400 block">{item.secondaryBadge}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Navigation Bar */}
          {query.trim() && totalCount > 0 && (
            <div className="p-3 border-t border-amber-500/20 bg-black/70 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="hidden sm:flex items-center gap-3 text-zinc-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-amber-300 text-[10px]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-amber-300 text-[10px]">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-amber-300 text-[10px]">Enter</kbd>
                  to open
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-amber-300 text-[10px]">Esc</kbd>
                  to close
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => handleViewAll(selectedCategory)}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                >
                  <span>
                    {selectedCategory === 'all'
                      ? `View all ${totalCount} results`
                      : selectedCategory === 'talent'
                      ? `See all ${filteredResults.talents.length} in Talent Registry`
                      : selectedCategory === 'casting'
                      ? `See all ${filteredResults.castingCalls.length} in Casting Calls`
                      : `See all in Shooting Locations`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-950" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

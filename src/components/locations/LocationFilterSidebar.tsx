import React from 'react';
import { 
  Building, 
  Trees, 
  Landmark, 
  Sparkles, 
  Layers, 
  MapPin, 
  Moon, 
  Zap, 
  Users, 
  Car, 
  RotateCcw, 
  Check, 
  X, 
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import { LocationCategoryType, ShootingLocation, KeralaDistrict } from '../../types';
import { KERALA_DISTRICTS } from '../../lib/constants';

export type CategoryFilterValue = 'all' | LocationCategoryType;
export type BudgetFilterValue = 'all' | 'budget' | 'mid' | 'premium';

export interface LocationFilterState {
  category: CategoryFilterValue;
  district: string;
  venueType: string;
  nightShootOnly: boolean;
  generatorOnly: boolean;
  largeCrewOnly: boolean;
  largeParkingOnly: boolean;
  budgetTier: BudgetFilterValue;
}

interface LocationFilterSidebarProps {
  filters: LocationFilterState;
  onFilterChange: (newFilters: LocationFilterState) => void;
  onResetFilters: () => void;
  allLocations: ShootingLocation[];
  onCloseMobile?: () => void;
  isMobile?: boolean;
}

export const CATEGORY_DEFINITIONS: {
  id: CategoryFilterValue;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeBg: string;
}[] = [
  {
    id: 'all',
    label: 'All Locations',
    subtitle: 'Full Mollywood catalogue',
    icon: Layers,
    color: 'text-zinc-300',
    badgeBg: 'bg-zinc-800 text-zinc-300'
  },
  {
    id: 'historical',
    label: 'Historical',
    subtitle: 'Nalukettu, Manas & Heritage',
    icon: Landmark,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
  },
  {
    id: 'modern',
    label: 'Modern',
    subtitle: 'Glass villas, industrial & luxury',
    icon: Sparkles,
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
  },
  {
    id: 'indoor',
    label: 'Indoor',
    subtitle: 'Courtyards, rooms & studio sets',
    icon: Building,
    color: 'text-blue-400',
    badgeBg: 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
  },
  {
    id: 'outdoor',
    label: 'Outdoor',
    subtitle: 'Tea hills, beaches & plantations',
    icon: Trees,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
  }
];

export const VENUE_TYPES = [
  'All Venue Types',
  'Traditional Kerala House',
  'Villa',
  'Tea Estate / Plantation',
  'Beach Property',
  'Warehouse / Factory',
  'Resort',
  'Nalukettu',
  'House'
];

export const POPULAR_FILM_DISTRICTS: KeralaDistrict[] = [
  'Palakkad',
  'Ernakulam',
  'Idukki',
  'Alappuzha',
  'Thrissur',
  'Wayanad'
];

// Helper to determine if a location matches a category
export function matchesCategory(loc: ShootingLocation, category: CategoryFilterValue): boolean {
  if (category === 'all') return true;

  const explicitTypes = loc.location_types || [];
  if (explicitTypes.includes(category as LocationCategoryType)) return true;

  // Fallback checks
  if (category === 'indoor') return loc.indoor_allowed === true;
  if (category === 'outdoor') return loc.outdoor_allowed === true;

  const combined = `${loc.title} ${loc.category_name} ${loc.description}`.toLowerCase();
  if (category === 'historical') {
    return (
      combined.includes('traditional') ||
      combined.includes('mana') ||
      combined.includes('tharavadu') ||
      combined.includes('nalukettu') ||
      combined.includes('heritage') ||
      combined.includes('historic') ||
      combined.includes('dutch') ||
      combined.includes('colonial') ||
      combined.includes('300-year') ||
      combined.includes('illam')
    );
  }

  if (category === 'modern') {
    return (
      combined.includes('modern') ||
      combined.includes('minimalist') ||
      combined.includes('contemporary') ||
      combined.includes('glass') ||
      combined.includes('resort') ||
      combined.includes('villa') ||
      combined.includes('industrial') ||
      combined.includes('warehouse') ||
      combined.includes('infopark')
    );
  }

  return false;
}

export const LocationFilterSidebar: React.FC<LocationFilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  allLocations,
  onCloseMobile,
  isMobile = false
}) => {
  // Count items per category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<CategoryFilterValue, number> = {
      all: allLocations.length,
      indoor: 0,
      outdoor: 0,
      historical: 0,
      modern: 0
    };

    allLocations.forEach(loc => {
      if (matchesCategory(loc, 'indoor')) counts.indoor++;
      if (matchesCategory(loc, 'outdoor')) counts.outdoor++;
      if (matchesCategory(loc, 'historical')) counts.historical++;
      if (matchesCategory(loc, 'modern')) counts.modern++;
    });

    return counts;
  }, [allLocations]);

  const hasActiveFilters = 
    filters.category !== 'all' ||
    filters.district !== 'all' ||
    filters.venueType !== 'All Venue Types' ||
    filters.nightShootOnly ||
    filters.generatorOnly ||
    filters.largeCrewOnly ||
    filters.largeParkingOnly ||
    filters.budgetTier !== 'all';

  const handleCategorySelect = (catId: CategoryFilterValue) => {
    onFilterChange({
      ...filters,
      category: catId
    });
  };

  return (
    <div className={`space-y-6 text-white ${isMobile ? 'p-4' : 'p-5 rounded-2xl bg-[#12141c] border border-white/10 shadow-xl'}`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-rose-400" />
          <h3 className="font-bold text-sm tracking-wide uppercase text-white font-cinematic">
            Location Filters
          </h3>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors px-2 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20"
            title="Reset all filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}

        {isMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* SECTION 1: Primary Categories (Indoor, Outdoor, Historical, Modern) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Location Category
          </label>
          <span className="text-[10px] text-zinc-500 font-medium">Click to filter</span>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {CATEGORY_DEFINITIONS.map(cat => {
            const Icon = cat.icon;
            const isSelected = filters.category === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'bg-rose-600/15 border-rose-500/60 shadow-sm ring-1 ring-rose-500/40'
                    : 'bg-black/30 hover:bg-white/5 border-white/5 hover:border-white/15 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform ${
                      isSelected
                        ? 'bg-rose-600 text-white scale-105'
                        : 'bg-white/5 text-zinc-400 group-hover:text-white group-hover:scale-105'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-bold leading-tight truncate ${isSelected ? 'text-white' : 'text-zinc-200 group-hover:text-white'}`}>
                      {cat.label}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      {cat.subtitle}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-2 transition-colors ${
                    isSelected
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/5 text-zinc-400 group-hover:bg-white/10 group-hover:text-zinc-200'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Kerala Film District */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>Kerala District</span>
          </span>
          {filters.district !== 'all' && (
            <button
              onClick={() => onFilterChange({ ...filters, district: 'all' })}
              className="text-[10px] text-rose-400 hover:underline capitalize"
            >
              Clear
            </button>
          )}
        </label>

        <select
          value={filters.district}
          onChange={e => onFilterChange({ ...filters, district: e.target.value })}
          className="w-full bg-black/50 border border-white/10 hover:border-white/20 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
        >
          <option value="all">All 14 Kerala Districts</option>
          {KERALA_DISTRICTS.map(d => (
            <option key={d} value={d}>
              {d} District
            </option>
          ))}
        </select>

        {/* Quick District Shortcut Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {POPULAR_FILM_DISTRICTS.map(d => {
            const isSelected = filters.district === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => onFilterChange({ ...filters, district: isSelected ? 'all' : d })}
                className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-rose-600 text-white border-rose-500 font-semibold'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border-white/5'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Venue Architecture Type */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
          Venue Architecture
        </label>
        <select
          value={filters.venueType}
          onChange={e => onFilterChange({ ...filters, venueType: e.target.value })}
          className="w-full bg-black/50 border border-white/10 hover:border-white/20 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
        >
          {VENUE_TYPES.map(vt => (
            <option key={vt} value={vt}>
              {vt}
            </option>
          ))}
        </select>
      </div>

      {/* SECTION 4: Technical Clearances & Infrastructure */}
      <div className="space-y-2.5 pt-2 border-t border-white/10">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
          Shoot Clearances & Amenities
        </label>

        <div className="space-y-2">
          {/* Night shoot */}
          <label className="flex items-center justify-between p-2 rounded-xl bg-black/30 hover:bg-white/5 border border-white/5 cursor-pointer text-xs text-zinc-300 transition-colors">
            <span className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Night Shoots Permitted</span>
            </span>
            <input
              type="checkbox"
              checked={filters.nightShootOnly}
              onChange={e => onFilterChange({ ...filters, nightShootOnly: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-zinc-800 text-rose-600 focus:ring-rose-500"
            />
          </label>

          {/* Generator */}
          <label className="flex items-center justify-between p-2 rounded-xl bg-black/30 hover:bg-white/5 border border-white/5 cursor-pointer text-xs text-zinc-300 transition-colors">
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Generator Access Ready</span>
            </span>
            <input
              type="checkbox"
              checked={filters.generatorOnly}
              onChange={e => onFilterChange({ ...filters, generatorOnly: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-zinc-800 text-rose-600 focus:ring-rose-500"
            />
          </label>

          {/* Crew 100+ */}
          <label className="flex items-center justify-between p-2 rounded-xl bg-black/30 hover:bg-white/5 border border-white/5 cursor-pointer text-xs text-zinc-300 transition-colors">
            <span className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Crew 100+ Capacity</span>
            </span>
            <input
              type="checkbox"
              checked={filters.largeCrewOnly}
              onChange={e => onFilterChange({ ...filters, largeCrewOnly: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-zinc-800 text-rose-600 focus:ring-rose-500"
            />
          </label>

          {/* Parking 25+ */}
          <label className="flex items-center justify-between p-2 rounded-xl bg-black/30 hover:bg-white/5 border border-white/5 cursor-pointer text-xs text-zinc-300 transition-colors">
            <span className="flex items-center gap-2">
              <Car className="w-3.5 h-3.5 text-rose-400" />
              <span>Heavy Unit Parking (25+)</span>
            </span>
            <input
              type="checkbox"
              checked={filters.largeParkingOnly}
              onChange={e => onFilterChange({ ...filters, largeParkingOnly: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-zinc-800 text-rose-600 focus:ring-rose-500"
            />
          </label>
        </div>
      </div>

      {/* SECTION 5: Budget / Price Tier */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>Daily Rate Range</span>
          </span>
        </label>

        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            { id: 'all' as BudgetFilterValue, label: 'All Rates' },
            { id: 'budget' as BudgetFilterValue, label: 'Under ₹25k' },
            { id: 'mid' as BudgetFilterValue, label: '₹25k – ₹35k' },
            { id: 'premium' as BudgetFilterValue, label: '₹35k+' },
          ].map(tier => (
            <button
              key={tier.id}
              type="button"
              onClick={() => onFilterChange({ ...filters, budgetTier: tier.id })}
              className={`py-1.5 px-2 rounded-lg border text-center transition-all text-xs ${
                filters.budgetTier === tier.id
                  ? 'bg-rose-600 text-white border-rose-500 font-semibold'
                  : 'bg-black/30 hover:bg-white/5 text-zinc-400 hover:text-white border-white/5'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Info Box for Productions */}
      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-rose-500/10 border border-amber-500/20 text-[11px] text-zinc-300 space-y-1">
        <div className="font-semibold text-amber-300 flex items-center gap-1">
          <span>Kerala Cine Scouting Note</span>
        </div>
        <p className="text-zinc-400 leading-relaxed text-[10px]">
          All listed heritage illams and modern villas include direct owner contact and local panchayat/police single-window facilitation.
        </p>
      </div>
    </div>
  );
};

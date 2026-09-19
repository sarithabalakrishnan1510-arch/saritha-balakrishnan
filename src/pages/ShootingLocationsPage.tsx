import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  MapPin, 
  Search, 
  Filter, 
  ShieldCheck, 
  Moon, 
  Zap, 
  Car, 
  Users, 
  Phone, 
  Calendar,
  CheckCircle2,
  PlusCircle,
  RotateCcw,
  SlidersHorizontal,
  X,
  Building,
  Trees,
  Landmark,
  Sparkles,
  Layers,
  Sparkle,
  Heart,
  Camera,
  Eye,
  FileDown,
  Map,
  LayoutGrid,
  Columns
} from 'lucide-react';
import { useApp } from '../lib/store/appStore';
import { useFavorites } from '../lib/store/favoritesStore';
import { useLocationReviews } from '../lib/store/locationReviewsStore';
import { downloadLocationBookingPdf } from '../lib/utils/exportLocationPdf';
import { ShootingLocation, KeralaDistrict, LocationCategoryType } from '../types';
import { KERALA_DISTRICTS } from '../lib/constants';
import { 
  LocationFilterSidebar, 
  LocationFilterState, 
  CategoryFilterValue,
  matchesCategory,
  CATEGORY_DEFINITIONS
} from '../components/locations/LocationFilterSidebar';
import { LocationDetailsModal } from '../components/locations/LocationDetailsModal';
import { LocationRatingBadge } from '../components/locations/LocationRatingBadge';
import { LocationBookingModal } from '../components/locations/LocationBookingModal';
import { LocationMapView } from '../components/locations/LocationMapView';
import { ShareButton } from '../components/common/ShareButton';

function parsePrice(text: string): number {
  if (!text) return 0;
  const match = text.replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

const INITIAL_FILTERS: LocationFilterState = {
  category: 'all',
  district: 'all',
  venueType: 'All Venue Types',
  nightShootOnly: false,
  generatorOnly: false,
  largeCrewOnly: false,
  largeParkingOnly: false,
  budgetTier: 'all',
};

export const ShootingLocationsPage: React.FC = () => {
  const { locations, createLocation, currentUser, currentProduction, projects } = useApp();
  const { isFavoriteLocation, toggleFavoriteLocation, savedLocationIds } = useFavorites();
  const { getLocationRatingSummary } = useLocationReviews();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';
  const [search, setSearch] = useState(initialQuery);

  const [filters, setFilters] = useState<LocationFilterState>(INITIAL_FILTERS);
  const [savedOnly, setSavedOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedLocationForInquiry, setSelectedLocationForInquiry] = useState<ShootingLocation | null>(null);
  const [selectedLocationForDetails, setSelectedLocationForDetails] = useState<ShootingLocation | null>(null);
  const [quickExportingId, setQuickExportingId] = useState<string | null>(null);

  // View Mode: 'grid' | 'map' | 'split'
  const initialView = (searchParams.get('view') as 'grid' | 'map' | 'split') || 'grid';
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'split'>(
    ['grid', 'map', 'split'].includes(initialView) ? initialView : 'grid'
  );

  const handleViewModeChange = (mode: 'grid' | 'map' | 'split') => {
    setViewMode(mode);
    const newParams = new URLSearchParams(searchParams);
    if (mode === 'grid') {
      newParams.delete('view');
    } else {
      newParams.set('view', mode);
    }
    setSearchParams(newParams, { replace: true });
  };

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

  // Sync with searchParams
  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('search');
    if (q !== null) {
      setSearch(q);
    }

    const cat = searchParams.get('category');
    if (cat && ['all', 'indoor', 'outdoor', 'historical', 'modern'].includes(cat.toLowerCase())) {
      setFilters(prev => ({ ...prev, category: cat.toLowerCase() as CategoryFilterValue }));
    }

    const dist = searchParams.get('district');
    if (dist) {
      setFilters(prev => ({ ...prev, district: dist }));
    }

    const locId = searchParams.get('location') || searchParams.get('id');
    if (locId) {
      const found = locations.find(l => l.id === locId || l.slug === locId);
      if (found) {
        setSelectedLocationForDetails(found);
      }
    }

    const viewParam = searchParams.get('view');
    if (viewParam === 'map' || viewParam === 'split' || viewParam === 'grid') {
      setViewMode(viewParam);
    }
  }, [searchParams, locations]);

  const handleOpenDetails = (loc: ShootingLocation) => {
    setSelectedLocationForDetails(loc);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('location', loc.id);
    setSearchParams(newParams, { replace: true });
  };

  const handleCloseDetails = () => {
    setSelectedLocationForDetails(null);
    if (searchParams.get('location') || searchParams.get('id')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('location');
      newParams.delete('id');
      setSearchParams(newParams, { replace: true });
    }
  };

  // New location modal state
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [locTitle, setLocTitle] = useState('');
  const [locCategory, setLocCategory] = useState('Traditional Kerala House');
  const [locDistrict, setLocDistrict] = useState<KeralaDistrict>('Palakkad');
  const [locCity, setLocCity] = useState('Ottapalam');
  const [locPrice, setLocPrice] = useState('₹30,000 / day');
  const [locDesc, setLocDesc] = useState('');
  const [locIndoor, setLocIndoor] = useState(true);
  const [locOutdoor, setLocOutdoor] = useState(true);
  const [locHistorical, setLocHistorical] = useState(true);
  const [locModern, setLocModern] = useState(false);
  const [locNightShoot, setLocNightShoot] = useState(true);
  const [locGenerator, setLocGenerator] = useState(true);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTypes: LocationCategoryType[] = [];
    if (locIndoor) selectedTypes.push('indoor');
    if (locOutdoor) selectedTypes.push('outdoor');
    if (locHistorical) selectedTypes.push('historical');
    if (locModern) selectedTypes.push('modern');

    createLocation({
      title: locTitle,
      category_name: locCategory,
      location_types: selectedTypes,
      district: locDistrict,
      city: locCity,
      pricing_text: locPrice,
      description: locDesc,
      indoor_allowed: locIndoor,
      outdoor_allowed: locOutdoor,
      night_shoot_allowed: locNightShoot,
      generator_access: locGenerator,
    });
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      setIsAddLocationOpen(false);
      setLocTitle('');
      setLocDesc('');
    }, 1500);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearch('');
  };

  // Filtered Locations
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      // 0. Saved Only
      if (savedOnly && !savedLocationIds.includes(loc.id)) {
        return false;
      }

      // 1. Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          loc.title.toLowerCase().includes(q) ||
          loc.category_name.toLowerCase().includes(q) ||
          loc.description.toLowerCase().includes(q) ||
          loc.city.toLowerCase().includes(q) ||
          loc.district.toLowerCase().includes(q);
        if (!match) return false;
      }

      // 2. Category ('indoor' | 'outdoor' | 'historical' | 'modern' | 'all')
      if (filters.category !== 'all') {
        if (!matchesCategory(loc, filters.category)) return false;
      }

      // 3. District
      if (filters.district !== 'all' && loc.district !== filters.district) {
        return false;
      }

      // 4. Venue Type
      if (filters.venueType !== 'All Venue Types' && loc.category_name !== filters.venueType) {
        return false;
      }

      // 5. Amenities & Clearances
      if (filters.nightShootOnly && !loc.night_shoot_allowed) return false;
      if (filters.generatorOnly && !loc.generator_access) return false;
      if (filters.largeCrewOnly && loc.crew_capacity < 100) return false;
      if (filters.largeParkingOnly && loc.parking_capacity < 25) return false;

      // 6. Budget Tier
      if (filters.budgetTier !== 'all') {
        const price = parsePrice(loc.pricing_text);
        if (price > 0) {
          if (filters.budgetTier === 'budget' && price > 25000) return false;
          if (filters.budgetTier === 'mid' && (price <= 25000 || price > 35000)) return false;
          if (filters.budgetTier === 'premium' && price <= 35000) return false;
        }
      }

      return true;
    });
  }, [locations, search, filters, savedOnly, savedLocationIds]);

  // Active filter count for mobile badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.district !== 'all') count++;
    if (filters.venueType !== 'All Venue Types') count++;
    if (filters.nightShootOnly) count++;
    if (filters.generatorOnly) count++;
    if (filters.largeCrewOnly) count++;
    if (filters.largeParkingOnly) count++;
    if (filters.budgetTier !== 'all') count++;
    if (search.trim()) count++;
    return count;
  }, [filters, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Kerala Film Locations Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-cinematic tracking-tight">
            Shooting Locations & Nalukettu Registry
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Curated 300-year heritage illams, misty tea estates, backwater tharavadus, and contemporary glass villas with verified police and panchayat single-window shoot clearances.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Toggle Visual Map */}
          <button
            id="header-map-view-toggle"
            type="button"
            onClick={() => handleViewModeChange(viewMode === 'map' ? 'grid' : 'map')}
            className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow ${
              viewMode === 'map'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#1a1c26] border-white/15 hover:border-white/30 text-zinc-200 hover:text-white'
            }`}
            title="Toggle Visual Leaflet Map View"
          >
            <Map className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{viewMode === 'map' ? 'Cards View' : 'Visual Map'}</span>
          </button>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden px-3.5 py-2.5 rounded-xl bg-[#1a1c26] border border-white/15 hover:border-white/30 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow"
          >
            <SlidersHorizontal className="w-4 h-4 text-rose-400" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-[10px] font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsAddLocationOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/20 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List Shooting Property</span>
          </button>
        </div>
      </div>

      {/* Quick Search & Category Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search mana, villa, tea estate, Nalukettu, Ottapalam, Kakkanad..."
              className="w-full bg-[#11131c] border border-white/10 hover:border-white/20 focus:border-rose-500 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none transition-all shadow-inner"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-white p-0.5 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Category Chips for Fast 1-Tap Switching */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORY_DEFINITIONS.map(cat => {
              const Icon = cat.icon;
              const isSelected = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilters(prev => ({ ...prev, category: cat.id }))}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all border shrink-0 ${
                    isSelected
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/30'
                      : 'bg-[#12141c] hover:bg-white/10 text-zinc-400 hover:text-white border-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : cat.color}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filters Summary Pills */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-zinc-500 text-[11px] font-medium">Active filters:</span>

            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px]">
                <span className="capitalize">{filters.category}</span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                  className="hover:text-white ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.district !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-zinc-300 text-[11px]">
                <span>{filters.district}</span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, district: 'all' }))}
                  className="hover:text-white ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.venueType !== 'All Venue Types' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-zinc-300 text-[11px]">
                <span>{filters.venueType}</span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, venueType: 'All Venue Types' }))}
                  className="hover:text-white ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.nightShootOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px]">
                <Moon className="w-3 h-3" />
                <span>Night Shoots</span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, nightShootOnly: false }))}
                  className="hover:text-white ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.generatorOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px]">
                <Zap className="w-3 h-3" />
                <span>Generator Ready</span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, generatorOnly: false }))}
                  className="hover:text-white ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.largeCrewOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px]">
                <Users className="w-3 h-3" />
                <span>Crew 100+</span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, largeCrewOnly: false }))}
                  className="hover:text-white ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.largeParkingOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[11px]">
                <Car className="w-3 h-3" />
                <span>Parking 25+</span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, largeParkingOnly: false }))}
                  className="hover:text-white ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.budgetTier !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px]">
                <span className="capitalize">{filters.budgetTier} Tier</span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, budgetTier: 'all' }))}
                  className="hover:text-white ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-zinc-300 text-[11px]">
                <span>"{search}"</span>
                <button onClick={() => setSearch('')} className="hover:text-white ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-rose-400 hover:text-rose-300 font-semibold text-[11px] hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Main Layout: Filter Sidebar + Location Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-20 self-start">
          <LocationFilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onResetFilters={handleResetFilters}
            allLocations={locations}
          />
        </aside>

        {/* Locations Grid Content */}
        <main className="flex-1 min-w-0 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 bg-[#12141c] px-4 py-2.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-zinc-200">
                Showing {filteredLocations.length} shooting {filteredLocations.length === 1 ? 'property' : 'properties'}
                {filters.category !== 'all' && (
                  <span className="text-rose-400 font-normal"> for {filters.category} category</span>
                )}
              </span>

              {/* Saved Only Filter Pill */}
              <button
                id="saved-locations-filter-toggle"
                onClick={() => setSavedOnly(!savedOnly)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  savedOnly
                    ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border-white/10'
                }`}
                title="Filter to only your saved favorite locations"
              >
                <Heart className={`w-3.5 h-3.5 ${savedOnly ? 'fill-white text-white' : 'text-rose-400'}`} />
                <span>Saved ({savedLocationIds.length})</span>
              </button>
            </div>

            {/* View Mode Toggle: Cards Grid vs Interactive Leaflet Map vs Split View */}
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 shrink-0">
              <button
                id="view-mode-grid-btn"
                type="button"
                onClick={() => handleViewModeChange('grid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards Grid</span>
              </button>

              <button
                id="view-mode-map-btn"
                type="button"
                onClick={() => handleViewModeChange('map')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'map'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
                title="Interactive Leaflet Map View"
              >
                <Map className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Visual Map</span>
              </button>

              <button
                id="view-mode-split-btn"
                type="button"
                onClick={() => handleViewModeChange('split')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'split'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
                title="Split Map & Grid View"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split</span>
              </button>
            </div>
          </div>

          {filteredLocations.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#12141c] border border-white/10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 text-zinc-400 flex items-center justify-center mx-auto">
                <Filter className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-cinematic">
                  No Shooting Locations Match Your Criteria
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Try clearing some category or amenity filters to discover more Kerala heritage and modern properties.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Map View Mode */}
              {viewMode === 'map' && (
                <LocationMapView
                  locations={filteredLocations}
                  onOpenDetails={handleOpenDetails}
                  onBookLocation={setSelectedLocationForInquiry}
                  onQuickExportPdf={handleQuickExportPdf}
                  selectedLocationId={selectedLocationForDetails?.id}
                />
              )}

              {/* Split View Mode (Map on top, Cards below) */}
              {viewMode === 'split' && (
                <div className="space-y-6">
                  <LocationMapView
                    locations={filteredLocations}
                    onOpenDetails={handleOpenDetails}
                    onBookLocation={setSelectedLocationForInquiry}
                    onQuickExportPdf={handleQuickExportPdf}
                    selectedLocationId={selectedLocationForDetails?.id}
                  />

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-cinematic flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span>Mapped Film Locations ({filteredLocations.length})</span>
                      </h3>
                      <span className="text-[11px] text-zinc-500">Click any card or map pin to inspect</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredLocations.map(loc => {
                        const isHistorical = matchesCategory(loc, 'historical');
                        const isModern = matchesCategory(loc, 'modern');

                        return (
                          <div
                            key={loc.id}
                            className="rounded-2xl bg-[#13151f] border border-white/10 overflow-hidden hover:border-rose-500/40 transition-all flex flex-col justify-between shadow-xl group hover:shadow-2xl hover:shadow-rose-950/20"
                          >
                            <div>
                              {/* Image Header with Badges - Clickable to open Details & Gallery */}
                              <div 
                                onClick={() => handleOpenDetails(loc)}
                                className="h-56 w-full relative overflow-hidden bg-zinc-900 cursor-pointer group-hover:brightness-105 transition-all"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleOpenDetails(loc);
                                  }
                                }}
                                aria-label={`View photo gallery and details for ${loc.title}`}
                              >
                                <img
                                  src={loc.image_urls[0] || 'https://images.unsplash.com/photo-1590059390047-5a02e6462444?w=800&fit=crop'}
                                  alt={loc.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                                {/* Top Left Badges */}
                                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%] z-10 pointer-events-none">
                                  {isHistorical && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 backdrop-blur-md flex items-center gap-1 shadow-sm">
                                      <Landmark className="w-3 h-3 text-amber-400" />
                                      Historical
                                    </span>
                                  )}
                                  {isModern && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40 backdrop-blur-md flex items-center gap-1 shadow-sm">
                                      <Sparkles className="w-3 h-3 text-rose-400" />
                                      Modern
                                    </span>
                                  )}
                                  {loc.indoor_allowed && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-blue-300 border border-blue-500/30 backdrop-blur-md">
                                      Indoor
                                    </span>
                                  )}
                                  {loc.outdoor_allowed && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                                      Outdoor
                                    </span>
                                  )}
                                </div>

                                {/* Top Right: Verified Badge, Share Button & Favorite Button */}
                                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                                  {loc.verification_status === 'verified' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/70 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3" />
                                      Verified
                                    </span>
                                  )}
                                  <ShareButton
                                    title={loc.title}
                                    url={`/locations?location=${loc.id}`}
                                    description={`${loc.title} (${loc.category_name}) in ${loc.city}, ${loc.district} District - ${loc.pricing_text}`}
                                    type="location"
                                    variant="icon"
                                    size="sm"
                                    className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-zinc-300 hover:text-white"
                                  />
                                  <button
                                    id={`fav-loc-split-btn-${loc.id}`}
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleFavoriteLocation(loc.id, loc.title);
                                    }}
                                    className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${
                                      isFavoriteLocation(loc.id)
                                        ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/40'
                                        : 'bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white border-white/20'
                                    }`}
                                    title={isFavoriteLocation(loc.id) ? 'Remove from saved favorites' : 'Save location to personal list'}
                                  >
                                    <Heart className={`w-3.5 h-3.5 transition-transform active:scale-75 ${isFavoriteLocation(loc.id) ? 'fill-white text-white' : ''}`} />
                                  </button>
                                </div>

                                {/* Bottom Left Venue Category */}
                                <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/80 text-zinc-200 border border-white/10 backdrop-blur-sm">
                                    {loc.category_name}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/80 text-rose-300 border border-rose-500/30 backdrop-blur-sm flex items-center gap-1">
                                    <Camera className="w-3 h-3 text-rose-400" />
                                    {loc.image_urls.length} {loc.image_urls.length === 1 ? 'Photo' : 'Photos'}
                                  </span>
                                </div>

                                {/* Bottom Right Price */}
                                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-xs font-bold text-white border border-white/15 shadow-sm z-10">
                                  {loc.pricing_text}
                                </div>
                              </div>

                              {/* Card Body */}
                              <div className="p-5 space-y-3.5 text-xs">
                                <div 
                                  onClick={() => handleOpenDetails(loc)}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors leading-snug">
                                      {loc.title}
                                    </h3>
                                    <LocationRatingBadge locationId={loc.id} size="sm" />
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
                                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                    <span>{loc.city}, {loc.district} District</span>
                                  </div>
                                </div>

                                <p className="text-zinc-300 text-xs leading-relaxed line-clamp-2">
                                  {loc.description}
                                </p>

                                {/* Infrastructure Grid */}
                                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 text-[11px] text-zinc-400">
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
                                    <span>Generator: {loc.generator_access ? 'Ready' : 'No'}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Night Shoot: {loc.night_shoot_allowed ? 'Permitted' : 'Day Only'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Card Footer */}
                            <div className="p-5 pt-0 border-t border-white/5 mt-2 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDetails(loc)}
                                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 font-medium text-xs transition-colors flex items-center gap-1.5"
                                >
                                  <Eye className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Scout & Reviews</span>
                                </button>
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
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickExportPdf(loc);
                                  }}
                                  disabled={quickExportingId === loc.id}
                                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/30 font-medium text-xs transition-colors flex items-center gap-1 active:scale-95 disabled:opacity-50"
                                  title="Export location booking details into a formatted PDF"
                                >
                                  <FileDown className="w-3.5 h-3.5 text-amber-400" />
                                  <span className="hidden sm:inline text-[11px]">{quickExportingId === loc.id ? 'Exporting...' : 'PDF'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLocationForInquiry(loc);
                                  }}
                                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow hover:shadow-rose-900/40 flex items-center gap-1.5 active:scale-95"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>Book Shift</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Grid View Mode */}
              {viewMode === 'grid' && (
                <div className="space-y-5">
                  {/* Quick Visual Map Banner */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#171926] via-[#12141f] to-[#1e1520] border border-white/10 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 shrink-0">
                        <Map className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-2">
                          <span>Interactive Kerala Film Scouting Map</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">Leaflet.js</span>
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Geographic markers with shift rates, crew clearances, and single-click PDF booking export.
                        </p>
                      </div>
                    </div>
                    <button
                      id="open-map-banner-btn"
                      type="button"
                      onClick={() => handleViewModeChange('map')}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow hover:scale-[1.02] shrink-0"
                    >
                      <Map className="w-3.5 h-3.5" />
                      <span>Switch to Visual Map</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredLocations.map(loc => {
                      const isHistorical = matchesCategory(loc, 'historical');
                      const isModern = matchesCategory(loc, 'modern');

                      return (
                        <div
                          key={loc.id}
                          className="rounded-2xl bg-[#13151f] border border-white/10 overflow-hidden hover:border-rose-500/40 transition-all flex flex-col justify-between shadow-xl group hover:shadow-2xl hover:shadow-rose-950/20"
                        >
                          <div>
                            {/* Image Header with Badges - Clickable to open Details & Gallery */}
                            <div 
                              onClick={() => handleOpenDetails(loc)}
                              className="h-56 w-full relative overflow-hidden bg-zinc-900 cursor-pointer group-hover:brightness-105 transition-all"
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleOpenDetails(loc);
                                }
                              }}
                              aria-label={`View photo gallery and details for ${loc.title}`}
                            >
                              <img
                                src={loc.image_urls[0] || 'https://images.unsplash.com/photo-1590059390047-5a02e6462444?w=800&fit=crop'}
                                alt={loc.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                              {/* Top Left Badges */}
                              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%] z-10 pointer-events-none">
                                {isHistorical && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 backdrop-blur-md flex items-center gap-1 shadow-sm">
                                    <Landmark className="w-3 h-3 text-amber-400" />
                                    Historical
                                  </span>
                                )}
                                {isModern && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40 backdrop-blur-md flex items-center gap-1 shadow-sm">
                                    <Sparkles className="w-3 h-3 text-rose-400" />
                                    Modern
                                  </span>
                                )}
                                {loc.indoor_allowed && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-blue-300 border border-blue-500/30 backdrop-blur-md">
                                    Indoor
                                  </span>
                                )}
                                {loc.outdoor_allowed && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                                    Outdoor
                                  </span>
                                )}
                              </div>

                              {/* Top Right: Verified Badge, Share Button & Favorite Button */}
                              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                                {loc.verification_status === 'verified' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/70 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" />
                                    Verified
                                  </span>
                                )}
                                <ShareButton
                                  title={loc.title}
                                  url={`/locations?location=${loc.id}`}
                                  description={`${loc.title} (${loc.category_name}) in ${loc.city}, ${loc.district} District - ${loc.pricing_text}`}
                                  type="location"
                                  variant="icon"
                                  size="sm"
                                  className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-zinc-300 hover:text-white"
                                />
                                <button
                                  id={`fav-loc-btn-${loc.id}`}
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleFavoriteLocation(loc.id, loc.title);
                                  }}
                                  className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${
                                    isFavoriteLocation(loc.id)
                                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/40'
                                      : 'bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white border-white/20'
                                  }`}
                                  title={isFavoriteLocation(loc.id) ? 'Remove from saved favorites' : 'Save location to personal list'}
                                  aria-label={isFavoriteLocation(loc.id) ? 'Remove from saved favorites' : 'Save location to personal list'}
                                >
                                  <Heart className={`w-3.5 h-3.5 transition-transform active:scale-75 ${isFavoriteLocation(loc.id) ? 'fill-white text-white' : ''}`} />
                                </button>
                              </div>

                              {/* Bottom Left Venue Category & Photo Count Tag */}
                              <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/80 text-zinc-200 border border-white/10 backdrop-blur-sm">
                                  {loc.category_name}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/80 text-rose-300 border border-rose-500/30 backdrop-blur-sm flex items-center gap-1">
                                  <Camera className="w-3 h-3 text-rose-400" />
                                  {loc.image_urls.length} {loc.image_urls.length === 1 ? 'Photo' : 'Photos'}
                                </span>
                              </div>

                              {/* Bottom Right Price */}
                              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-xs font-bold text-white border border-white/15 shadow-sm z-10">
                                {loc.pricing_text}
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 space-y-3.5 text-xs">
                              <div 
                                onClick={() => handleOpenDetails(loc)}
                                className="cursor-pointer"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors leading-snug">
                                    {loc.title}
                                  </h3>
                                  <LocationRatingBadge locationId={loc.id} size="sm" />
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
                                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                  <span>{loc.city}, {loc.district} District</span>
                                </div>
                              </div>

                              <p className="text-zinc-300 text-xs leading-relaxed line-clamp-2">
                                {loc.description}
                              </p>

                              {/* Infrastructure & Clearance Grid */}
                              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 text-[11px] text-zinc-400">
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
                                  <span>Generator: {loc.generator_access ? 'Ready' : 'No'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>Night Shoot: {loc.night_shoot_allowed ? 'Permitted' : 'Day Only'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className="p-5 pt-0 border-t border-white/5 mt-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <button
                                id={`view-details-btn-${loc.id}`}
                                type="button"
                                onClick={() => handleOpenDetails(loc)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 font-medium text-xs transition-colors flex items-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5 text-rose-400" />
                                <span>Scout & Reviews</span>
                              </button>
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
                                id={`export-pdf-card-btn-${loc.id}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickExportPdf(loc);
                                }}
                                disabled={quickExportingId === loc.id}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/30 font-medium text-xs transition-colors flex items-center gap-1 active:scale-95 disabled:opacity-50"
                                title="Export location booking details into a formatted PDF for production planning"
                              >
                                <FileDown className="w-3.5 h-3.5 text-amber-400" />
                                <span className="hidden sm:inline text-[11px]">{quickExportingId === loc.id ? 'Exporting...' : 'PDF'}</span>
                              </button>

                              <button
                                id={`book-loc-btn-${loc.id}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLocationForInquiry(loc);
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow hover:shadow-rose-900/40 flex items-center gap-1.5 active:scale-95"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Book Shift</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-sm bg-[#12141c] h-full flex flex-col justify-between overflow-y-auto border-l border-white/10 shadow-2xl">
            <LocationFilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              allLocations={locations}
              onCloseMobile={() => setMobileFiltersOpen(false)}
              isMobile={true}
            />
            <div className="p-4 bg-[#0d0f16] border-t border-white/10 sticky bottom-0 flex gap-2">
              <button
                onClick={handleResetFilters}
                className="w-1/3 py-2.5 rounded-xl border border-white/10 text-zinc-300 hover:text-white text-xs font-semibold"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-2/3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow"
              >
                Apply ({filteredLocations.length} Results)
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

      {/* Add Location Modal */}
      {isAddLocationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#14161f] border border-white/15 p-6 space-y-4 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold font-cinematic">List Shooting Property / Location</h3>
              <button
                onClick={() => setIsAddLocationOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addedSuccess ? (
              <div className="text-center py-8 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <p className="text-sm font-semibold text-white">Property Registered Successfully!</p>
                <p className="text-xs text-zinc-400">Your shooting property has been submitted for admin verification.</p>
              </div>
            ) : (
              <form onSubmit={handleAddLocation} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Property Title *</label>
                  <input
                    required
                    type="text"
                    value={locTitle}
                    onChange={e => setLocTitle(e.target.value)}
                    placeholder="e.g. Traditional Nalukettu with Courtyard & Pond"
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Location Categories Checkboxes */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <label className="block font-semibold text-zinc-200">
                    Location Categories (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={locIndoor}
                        onChange={e => setLocIndoor(e.target.checked)}
                        className="rounded border-white/20 bg-zinc-800 text-rose-600"
                      />
                      <span>Indoor Shooting Sets</span>
                    </label>
                    <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={locOutdoor}
                        onChange={e => setLocOutdoor(e.target.checked)}
                        className="rounded border-white/20 bg-zinc-800 text-rose-600"
                      />
                      <span>Outdoor / Grounds</span>
                    </label>
                    <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={locHistorical}
                        onChange={e => setLocHistorical(e.target.checked)}
                        className="rounded border-white/20 bg-zinc-800 text-rose-600"
                      />
                      <span>Historical / Heritage</span>
                    </label>
                    <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={locModern}
                        onChange={e => setLocModern(e.target.checked)}
                        className="rounded border-white/20 bg-zinc-800 text-rose-600"
                      />
                      <span>Modern / Contemporary</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1">Architecture Category</label>
                    <select
                      value={locCategory}
                      onChange={e => setLocCategory(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="Traditional Kerala House">Traditional Kerala House (Mana/Tharavadu)</option>
                      <option value="Villa">Modern Villa</option>
                      <option value="Tea Estate / Plantation">Tea / Cardamom Plantation</option>
                      <option value="Beach Property">Beach Property</option>
                      <option value="Warehouse / Factory">Industrial / Warehouse</option>
                      <option value="Resort">Backwater Resort</option>
                      <option value="Nalukettu">Nalukettu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1">Kerala District</label>
                    <select
                      value={locDistrict}
                      onChange={e => setLocDistrict(e.target.value as KeralaDistrict)}
                      className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      {KERALA_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1">Town / City</label>
                    <input
                      type="text"
                      value={locCity}
                      onChange={e => setLocCity(e.target.value)}
                      placeholder="e.g. Ottapalam"
                      className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1">Daily Shoot Rate</label>
                    <input
                      type="text"
                      value={locPrice}
                      onChange={e => setLocPrice(e.target.value)}
                      placeholder="₹25,000 / day"
                      className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Clearances */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={locNightShoot}
                      onChange={e => setLocNightShoot(e.target.checked)}
                      className="rounded border-white/20 bg-zinc-800 text-rose-600"
                    />
                    <span>Night Shoots Permitted</span>
                  </label>
                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={locGenerator}
                      onChange={e => setLocGenerator(e.target.checked)}
                      className="rounded border-white/20 bg-zinc-800 text-rose-600"
                    />
                    <span>Generator Access Ready</span>
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Location Features & Architectural Details
                  </label>
                  <textarea
                    rows={3}
                    value={locDesc}
                    onChange={e => setLocDesc(e.target.value)}
                    placeholder="Describe courtyard, road approach, parking space, acoustic sound suitability..."
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddLocationOpen(false)}
                    className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                  >
                    Register Location
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Location Details Modal with Swipeable High-Resolution Gallery */}
      <LocationDetailsModal
        location={selectedLocationForDetails}
        onClose={handleCloseDetails}
        onBookLocation={(loc) => {
          handleCloseDetails();
          setSelectedLocationForInquiry(loc);
        }}
      />
    </div>
  );
};

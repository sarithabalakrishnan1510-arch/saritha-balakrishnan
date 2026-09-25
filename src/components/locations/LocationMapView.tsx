import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Layers,
  Maximize2,
  Calendar,
  Eye,
  Heart,
  FileDown,
  X,
  Star,
  Zap,
  Users,
  Car,
  Compass,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { ShootingLocation, KeralaDistrict } from '../../types';
import { useFavorites } from '../../lib/store/favoritesStore';
import { useLocationReviews } from '../../lib/store/locationReviewsStore';
import { getLocationCoordinates, KERALA_MAP_CENTER, KERALA_DEFAULT_ZOOM, KERALA_DISTRICT_COORDINATES } from '../../lib/utils/locationCoordinates';

interface LocationMapViewProps {
  locations: ShootingLocation[];
  onOpenDetails: (loc: ShootingLocation) => void;
  onBookLocation: (loc: ShootingLocation) => void;
  onQuickExportPdf: (loc: ShootingLocation) => void;
  selectedLocationId?: string | null;
  className?: string;
}

type MapTileLayer = 'dark' | 'voyager' | 'osm';

const TILE_LAYERS: Record<MapTileLayer, { url: string; attribution: string; name: string }> = {
  dark: {
    name: 'Cinematic Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
  },
  voyager: {
    name: 'Vibrant Scout',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
  },
  osm: {
    name: 'Standard Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }
};

const POPULAR_HUBS: { label: string; coords: [number, number]; zoom: number; district?: KeralaDistrict }[] = [
  { label: 'All Kerala', coords: KERALA_MAP_CENTER, zoom: 7.5 },
  { label: 'Fort Kochi & Ernakulam', coords: [9.9658, 76.26], zoom: 12, district: 'Ernakulam' },
  { label: 'Ottapalam (Manas)', coords: [10.7712, 76.38], zoom: 12, district: 'Palakkad' },
  { label: 'Munnar Hills', coords: [10.0889, 77.06], zoom: 11, district: 'Idukki' },
  { label: 'Kuttanad Backwaters', coords: [9.45, 76.48], zoom: 11, district: 'Alappuzha' },
  { label: 'Wayanad Rainforest', coords: [11.60, 76.10], zoom: 11, district: 'Wayanad' },
  { label: 'Kozhikode Coastal', coords: [11.30, 75.75], zoom: 11, district: 'Kozhikode' },
  { label: 'Thrissur Heritage', coords: [10.45, 76.21], zoom: 11, district: 'Thrissur' },
];

export const LocationMapView: React.FC<LocationMapViewProps> = ({
  locations,
  onOpenDetails,
  onBookLocation,
  onQuickExportPdf,
  selectedLocationId,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const { isFavoriteLocation, toggleFavoriteLocation } = useFavorites();
  const { getLocationRatingSummary } = useLocationReviews();

  const [activeLayer, setActiveLayer] = useState<MapTileLayer>('dark');
  const [activeLocation, setActiveLocation] = useState<ShootingLocation | null>(null);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: KERALA_MAP_CENTER,
      zoom: KERALA_DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tile = L.tileLayer(TILE_LAYERS[activeLayer].url, {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: TILE_LAYERS[activeLayer].attribution
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);

    tileLayerRef.current = tile;
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Invalidate size after animation
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile layer when style changed
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    tileLayerRef.current.setUrl(TILE_LAYERS[activeLayer].url);
  }, [activeLayer]);

  // Synchronize initial or external selectedLocationId
  useEffect(() => {
    if (selectedLocationId) {
      const matched = locations.find(l => l.id === selectedLocationId);
      if (matched) {
        setActiveLocation(matched);
      }
    }
  }, [selectedLocationId, locations]);

  // Render & Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    if (locations.length === 0) return;

    const bounds = L.latLngBounds([]);

    locations.forEach((loc) => {
      const coords = getLocationCoordinates(loc);
      bounds.extend(coords);

      const isSelected = activeLocation?.id === loc.id;
      const isFav = isFavoriteLocation(loc.id);

      // Custom styled HTML marker pin
      const markerHtml = `
        <div class="group relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${
          isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-20'
        }">
          ${
            isSelected
              ? `<div class="absolute -inset-2 bg-amber-500/40 rounded-full animate-ping pointer-events-none"></div>`
              : ''
          }
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-xl border backdrop-blur-md ${
            isSelected
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 border-amber-300 ring-2 ring-amber-400/80 font-black'
              : 'bg-[#0d0e14]/95 text-zinc-100 border-amber-500/20 hover:border-amber-400/80 hover:bg-[#161822]'
          }">
            <span class="w-2 h-2 rounded-full ${
              loc.night_shoot_allowed ? 'bg-indigo-400' : 'bg-emerald-400'
            }"></span>
            <span class="truncate max-w-[110px] text-[11px]">${loc.city}</span>
            <span class="text-[10px] font-mono px-1 rounded bg-black/50 text-amber-300">${loc.pricing_text.split('/')[0].trim()}</span>
          </div>
          ${
            isFav
              ? `<span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-[8px] text-zinc-950 font-bold border border-black">★</span>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-film-marker',
        iconSize: [120, 36],
        iconAnchor: [60, 18],
      });

      const marker = L.marker(coords, { icon: customIcon });

      marker.on('click', () => {
        setActiveLocation(loc);
        map.panTo(coords, { animate: true, duration: 0.6 });
      });

      markersLayer.addLayer(marker);
    });

    // If locations exist, fit bounds with pleasant padding
    if (locations.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 14,
      });
    }
  }, [locations, activeLocation?.id, isFavoriteLocation]);

  // Handle Pan to specific location
  const handleSelectLocation = (loc: ShootingLocation) => {
    setActiveLocation(loc);
    if (mapInstanceRef.current) {
      const coords = getLocationCoordinates(loc);
      mapInstanceRef.current.setView(coords, Math.max(mapInstanceRef.current.getZoom(), 12), {
        animate: true,
        duration: 0.8
      });
    }
  };

  const handleFitAll = () => {
    if (!mapInstanceRef.current || locations.length === 0) return;
    const bounds = L.latLngBounds(locations.map(l => getLocationCoordinates(l)));
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 13,
      });
    }
  };

  const handleHubSelect = (hub: typeof POPULAR_HUBS[0]) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(hub.coords, hub.zoom, { animate: true, duration: 0.8 });
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0d0e12] shadow-2xl flex flex-col ${className}`}>
      {/* Top Map Control Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 p-3 sm:px-4 bg-[#0d0e14]/95 backdrop-blur-md border-b border-amber-500/20 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white tracking-wide font-cinematic uppercase text-[12px] block">
              Kerala Film Scouting Map
            </span>
            <span className="text-[11px] text-zinc-400">
              {locations.length} {locations.length === 1 ? 'shoot venue mapped' : 'shoot venues mapped'} in high-definition
            </span>
          </div>
        </div>

        {/* Action Controls & Layer Selector */}
        <div className="flex items-center gap-2">
          {/* Quick Kerala Hub Jumps */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto max-w-md py-0.5">
            {POPULAR_HUBS.slice(0, 4).map((hub) => (
              <button
                key={hub.label}
                type="button"
                onClick={() => handleHubSelect(hub)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-amber-500/20 text-[11px] transition-colors whitespace-nowrap"
              >
                {hub.label}
              </button>
            ))}
          </div>

          {/* Fit all button */}
          <button
            type="button"
            onClick={handleFitAll}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Reset map zoom to view all current venues"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Fit All</span>
          </button>

          {/* Tile Layer Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{TILE_LAYERS[activeLayer].name}</span>
            </button>

            {isLayerMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-[#141620] border border-amber-500/30 p-1.5 shadow-2xl z-50 space-y-1">
                {(Object.keys(TILE_LAYERS) as MapTileLayer[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setActiveLayer(key);
                      setIsLayerMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      activeLayer === key
                        ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold'
                        : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{TILE_LAYERS[key].name}</span>
                    {activeLayer === key && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Canvas + Overlay Drawer */}
      <div className="relative flex-1 w-full min-h-[520px] md:min-h-[580px] lg:min-h-[640px]">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

        {/* Secondary Hub Chips (Mobile/Tablet scrollable) */}
        <div className="md:hidden absolute top-3 left-3 right-3 z-10 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {POPULAR_HUBS.map((hub) => (
            <button
              key={hub.label}
              type="button"
              onClick={() => handleHubSelect(hub)}
              className="px-2.5 py-1 rounded-full bg-[#0d0e14]/90 backdrop-blur-md text-zinc-200 border border-amber-500/20 text-[11px] font-medium whitespace-nowrap shadow-lg shrink-0"
            >
              {hub.label}
            </button>
          ))}
        </div>

        {/* Bottom Floating Location Card / Inspector */}
        {activeLocation ? (
          <div className="absolute bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 max-w-full z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="rounded-2xl bg-[#0d0e14]/95 backdrop-blur-xl border border-amber-500/30 p-4 shadow-2xl text-white space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-[10px] uppercase tracking-wider">
                    {activeLocation.category_name}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {activeLocation.city}, {activeLocation.district}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleFavoriteLocation(activeLocation.id)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-amber-400 transition-colors"
                    title="Toggle Favorite"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFavoriteLocation(activeLocation.id) ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLocation(null)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Location Image & Quick Details */}
              <div className="flex gap-3">
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-white/10 relative group">
                  <img
                    src={activeLocation.image_urls[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&fit=crop'}
                    alt={activeLocation.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-zinc-300">
                    {activeLocation.image_urls.length} pics
                  </span>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h4 className="font-bold text-sm text-white font-cinematic line-clamp-1">
                      {activeLocation.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {activeLocation.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-amber-400 font-extrabold text-sm font-mono">
                      {activeLocation.pricing_text}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{activeLocation.crew_capacity} crew</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Highlights Pill Row */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                {activeLocation.generator_access && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> Generator Van Ready
                  </span>
                )}
                {activeLocation.night_shoot_allowed && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Night Allowed
                  </span>
                )}
                {activeLocation.parking_capacity >= 20 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1">
                    <Car className="w-2.5 h-2.5" /> {activeLocation.parking_capacity} Vehicles
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex items-center gap-2 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => onOpenDetails(activeLocation)}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Scout Gallery</span>
                </button>

                <button
                  type="button"
                  onClick={() => onQuickExportPdf(activeLocation)}
                  className="py-2 px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  title="Export PDF Location Brief"
                >
                  <FileDown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => onBookLocation(activeLocation)}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-zinc-950 font-bold text-xs transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-zinc-950" />
                  <span>Book Shift</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty selection prompt badge */
          <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden sm:block">
            <div className="px-3 py-1.5 rounded-xl bg-[#0d0e14]/90 backdrop-blur-md border border-amber-500/20 text-zinc-400 text-xs flex items-center gap-2 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Click on any marker pin to inspect location fees, photos & clearances</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Horizontal Quick-Select Carousel of Mapped Locations */}
      <div className="p-3 bg-[#0d0e14] border-t border-amber-500/20 overflow-x-auto flex items-center gap-2.5 scrollbar-thin">
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 whitespace-nowrap pl-1">
          Quick Jump ({locations.length}):
        </span>
        {locations.map((loc) => {
          const isSelected = activeLocation?.id === loc.id;
          return (
            <button
              key={loc.id}
              type="button"
              onClick={() => handleSelectLocation(loc)}
              className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 border transition-all whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 border-amber-300 shadow-md scale-105 font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border-amber-500/20 font-medium'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>{loc.title.split(' ')[0]} {loc.title.split(' ')[1] || ''}</span>
              <span className="text-[10px] text-zinc-400 opacity-80">({loc.district})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

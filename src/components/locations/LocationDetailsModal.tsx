import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Heart, 
  Share2, 
  Phone, 
  Calendar, 
  Users, 
  Car, 
  Zap, 
  Moon, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Clock, 
  Check, 
  Sparkles,
  Building,
  Info,
  Copy,
  MessageSquareQuote,
  FileDown
} from 'lucide-react';
import { ShootingLocation } from '../../types';
import { useFavorites } from '../../lib/store/favoritesStore';
import { useApp } from '../../lib/store/appStore';
import { useLocationReviews } from '../../lib/store/locationReviewsStore';
import { downloadLocationBookingPdf } from '../../lib/utils/exportLocationPdf';
import { LocationImageGallery } from './LocationImageGallery';
import { ShareButton } from '../common/ShareButton';
import { LocationRatingBadge } from './LocationRatingBadge';
import { LocationReviewsSection } from './LocationReviewsSection';

interface LocationDetailsModalProps {
  location: ShootingLocation | null;
  onClose: () => void;
  onBookLocation: (location: ShootingLocation) => void;
}

export const LocationDetailsModal: React.FC<LocationDetailsModalProps> = ({
  location,
  onClose,
  onBookLocation,
}) => {
  const { isFavoriteLocation, toggleFavoriteLocation } = useFavorites();
  const { currentUser, currentProduction, projects } = useApp();
  const { getLocationRatingSummary } = useLocationReviews();
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!location) return null;

  const isFavorited = isFavoriteLocation(location.id);

  const handleExportPdf = () => {
    if (!location) return;
    setIsExportingPdf(true);
    try {
      const ratingSummary = getLocationRatingSummary(location.id);
      downloadLocationBookingPdf({
        location,
        projectTitle: projects[0]?.name,
        productionCompany: currentProduction?.company_name || (currentUser?.full_name ? `${currentUser.full_name} Productions` : undefined),
        lineProducerName: currentUser?.full_name,
        ratingAverage: ratingSummary.reviewCount > 0 ? ratingSummary.averageRating : undefined,
        reviewCount: ratingSummary.reviewCount > 0 ? ratingSummary.reviewCount : undefined
      });
    } catch (err) {
      console.error('Error generating booking PDF', err);
    } finally {
      setTimeout(() => setIsExportingPdf(false), 800);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/locations?location=${location.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div 
      id="location-details-modal-backdrop"
      className="fixed inset-0 z-[1050] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="location-details-dialog"
        className="relative w-full max-w-4xl rounded-3xl bg-[#12141d] border border-white/15 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-[#12141d]/95 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
              {location.category_name}
            </span>
            <LocationRatingBadge 
              locationId={location.id} 
              size="sm" 
              className="shrink-0 cursor-pointer"
              onClick={() => {
                document.getElementById('location-reviews-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <h2 className="text-base sm:text-lg font-bold font-cinematic truncate text-white">
              {location.title}
            </h2>
          </div>


          <div className="flex items-center gap-2 shrink-0">
            {/* Export Booking PDF Button */}
            <button
              id="details-export-pdf-header-btn"
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="p-2 sm:px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 transition-colors flex items-center gap-1.5 text-xs font-semibold active:scale-95"
              title="Export location booking details into a formatted PDF for production planning"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{isExportingPdf ? 'Exporting...' : 'Export PDF'}</span>
            </button>

            {/* Native Share Button */}
            <ShareButton
              title={location.title}
              url={`/locations?location=${location.id}`}
              description={`${location.title} in ${location.city}, ${location.district} - ${location.pricing_text}`}
              type="location"
              variant="button"
              label="Share"
              className="p-2 text-xs rounded-xl"
            />

            {/* Favorite Button */}
            <button
              id="favorite-location-details-btn"
              type="button"
              onClick={() => toggleFavoriteLocation(location.id, location.title)}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs ${
                isFavorited
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/40'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border-white/10'
              }`}
              title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white text-white' : 'text-rose-400'}`} />
              <span className="hidden sm:inline text-xs font-semibold">
                {isFavorited ? 'Saved' : 'Save'}
              </span>
            </button>

            {/* Close Dialog Button */}
            <button
              id="close-location-details-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-zinc-300 hover:text-white transition-colors"
              aria-label="Close location details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Responsive High-Resolution Image Gallery with Swiping */}
          <section aria-label="High-Resolution Photo Gallery">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-semibold text-zinc-200">Cinematic Photo Gallery</span>
                <span>•</span>
                <span>Swipe left/right or use thumbnail strip</span>
              </div>
              <span className="text-[11px] text-zinc-500 hidden sm:inline">
                High-Res Cinema Scouting Photos
              </span>
            </div>

            <LocationImageGallery
              images={location.image_urls}
              locationTitle={location.title}
              categoryName={location.category_name}
              district={location.district}
              aspectRatio="cinema"
            />
          </section>

          {/* Location Title & Geo Information */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-white/10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-cinematic text-white leading-tight">
                  {location.title}
                </h1>
                {location.verification_status === 'verified' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Property
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400 flex-wrap">
                <div className="flex items-center gap-1 text-rose-400">
                  <MapPin className="w-4 h-4" />
                  <span className="font-semibold text-zinc-200">{location.city}, {location.district} District</span>
                </div>
                <span>•</span>
                <span className="text-zinc-400">{location.approximate_location}</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('location-reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:underline flex items-center gap-1.5 text-amber-300"
                >
                  <LocationRatingBadge locationId={location.id} size="sm" />
                  <span className="text-[11px] underline">Recce Feedback</span>
                </button>
              </div>
            </div>

            {/* Price Card */}
            <div className="sm:text-right shrink-0 bg-black/40 border border-white/10 p-3.5 rounded-2xl">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 block font-medium">Standard Daily Rate</span>
              <span className="text-lg sm:text-xl font-extrabold text-white text-rose-300">
                {location.pricing_text}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">12-Hour Film Shift</span>
            </div>
          </div>


          {/* Quick Production Readiness Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Crew Capacity</span>
              </div>
              <p className="text-base font-bold text-white">Up to {location.crew_capacity} pax</p>
              <span className="text-[10px] text-zinc-500">Unit setup comfortable</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Car className="w-4 h-4 text-sky-400" />
                <span>Parking Fleet</span>
              </div>
              <p className="text-base font-bold text-white">{location.parking_capacity} Vehicles</p>
              <span className="text-[10px] text-zinc-500">Tempo & unit vans space</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Sync Generator</span>
              </div>
              <p className="text-base font-bold text-white">
                {location.generator_access ? 'Clearance Ready' : 'External Mobile'}
              </p>
              <span className="text-[10px] text-zinc-500">Soundproof van access</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Night Shoots</span>
              </div>
              <p className="text-base font-bold text-white">
                {location.night_shoot_allowed ? 'Permitted' : 'Day Shifts Only'}
              </p>
              <span className="text-[10px] text-zinc-500">Police NOC required</span>
            </div>
          </div>

          {/* Description & Scene Archetypes */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-rose-400" />
              Property Architecture & Scene Context
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-black/20 p-4 rounded-2xl border border-white/5">
              {location.description}
            </p>
          </div>

          {/* Facilities & Clearances Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* On-Site Amenities */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 text-xs">
              <h4 className="font-bold text-zinc-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Included Shoot Amenities
              </h4>
              <ul className="space-y-2 text-zinc-300">
                <li className="flex items-center justify-between">
                  <span>Indoor Set Access:</span>
                  <strong className={location.indoor_allowed ? 'text-emerald-400' : 'text-zinc-500'}>
                    {location.indoor_allowed ? 'Full Interior Access' : 'Exterior Only'}
                  </strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>Outdoor Grounds / Compound:</span>
                  <strong className={location.outdoor_allowed ? 'text-emerald-400' : 'text-zinc-500'}>
                    {location.outdoor_allowed ? 'Permitted' : 'Restricted'}
                  </strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>3-Phase Cine Power Supply:</span>
                  <strong className={location.power_available ? 'text-emerald-400' : 'text-amber-400'}>
                    {location.power_available ? 'Available' : 'Generator Required'}
                  </strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>Green Rooms / Makeup Changing:</span>
                  <strong className={location.changing_room ? 'text-emerald-400' : 'text-zinc-500'}>
                    {location.changing_room ? '2 Dedicated AC Suites' : 'Not available'}
                  </strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>Hygiene / Restrooms:</span>
                  <strong className={location.restroom ? 'text-emerald-400' : 'text-zinc-500'}>
                    {location.restroom ? 'Separate Unit Restrooms' : 'Mobile unit needed'}
                  </strong>
                </li>
              </ul>
            </div>

            {/* Regulatory & Liaison Guidelines */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 text-xs">
              <h4 className="font-bold text-amber-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Single-Window Government Liaison
              </h4>
              <ul className="space-y-2 text-zinc-300 text-[11px] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Village Panchayat NOC:</strong> Pre-cleared film shooting register with village administrative office.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Drone / Aerial Photography:</strong> Pre-approved designated flight corridors away from public highway wires.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Caretaker Coordination:</strong> Dedicated on-site property supervisor provided for key management and unit water.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Caretaker Direct Contact Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-black/50 to-zinc-900/60 border border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Phone className="w-4 h-4 text-rose-400" />
                <span className="text-xs uppercase tracking-wider font-semibold text-rose-300">
                  Property Manager / Caretaker Desk
                </span>
              </div>
              <p className="text-sm sm:text-base font-mono font-bold text-white">
                {location.owner_contact_private || 'Mana Trust Caretaker: +91 94471 88990'}
              </p>
              <p className="text-[11px] text-zinc-400">
                Official contact for recce visits, advance shift booking, and equipment loading.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto shrink-0">
              <button
                id="modal-export-planning-pdf-btn"
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95"
                title="Export location booking details into a formatted PDF for production planning"
              >
                <FileDown className="w-4 h-4 text-amber-400" />
                <span>{isExportingPdf ? 'Exporting...' : 'Export Planning PDF'}</span>
              </button>

              <button
                id="modal-book-location-btn"
                type="button"
                onClick={() => {
                  onClose();
                  onBookLocation(location);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-950/60 active:scale-95"
              >
                Book Shooting Shift
              </button>
            </div>
          </div>

          {/* Location Reviews & Ratings Section */}
          <LocationReviewsSection location={location} />
        </div>
      </div>
    </div>
  );

};

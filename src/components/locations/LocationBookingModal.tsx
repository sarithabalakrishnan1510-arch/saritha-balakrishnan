import React, { useState } from 'react';
import { 
  X, 
  FileDown, 
  Printer, 
  Calendar, 
  Phone, 
  Users, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Building2, 
  ShieldCheck, 
  Truck, 
  Volume2, 
  Sparkles,
  Clapperboard,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { ShootingLocation } from '../../types';
import { useApp } from '../../lib/store/appStore';
import { useLocationReviews } from '../../lib/store/locationReviewsStore';
import { downloadLocationBookingPdf, openLocationBookingPdfInNewTab } from '../../lib/utils/exportLocationPdf';

interface LocationBookingModalProps {
  location: ShootingLocation | null;
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_REQUIREMENTS = [
  '125 kVA Silent Sync Generator Parking',
  'Caravan / Vanity Van 32A Power hookup',
  'Crane / Jimmy Jib clearance & flat track ground',
  'Night shooting & outdoor lighting permission',
  'Sync sound ambient noise curfew clearance',
  'Drone aerial permit over private compound',
  'Special FX (Hazer / artificial rain machine)'
];

export const LocationBookingModal: React.FC<LocationBookingModalProps> = ({
  location,
  isOpen,
  onClose
}) => {
  const { currentUser, currentProduction, projects, recordLocationBooking } = useApp();
  const { getLocationRatingSummary } = useLocationReviews();

  const [projectTitle, setProjectTitle] = useState(projects[0]?.name || 'Malayalam Feature Film');
  const [productionCompany, setProductionCompany] = useState(
    currentProduction?.company_name || (currentUser?.full_name ? `${currentUser.full_name} Productions` : 'Kerala Cinema Studios')
  );
  const [lineProducerName, setLineProducerName] = useState(currentUser?.full_name || 'Line Producer');
  const [contactPhone, setContactPhone] = useState('+91 94470 12345');
  const [shootStartDate, setShootStartDate] = useState('2026-10-15');
  const [shootEndDate, setShootEndDate] = useState('2026-10-18');
  const [shiftType, setShiftType] = useState('Day Shift (06:00 AM - 06:00 PM)');
  const [numberOfShifts, setNumberOfShifts] = useState(3);
  const [crewCount, setCrewCount] = useState(location?.crew_capacity || 80);
  const [selectedReqs, setSelectedReqs] = useState<string[]>([
    '125 kVA Silent Sync Generator Parking',
    'Caravan / Vanity Van 32A Power hookup'
  ]);
  const [customNotes, setCustomNotes] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingRefId, setBookingRefId] = useState('');

  if (!isOpen || !location) return null;

  const ratingSummary = getLocationRatingSummary(location.id);

  const toggleReq = (req: string) => {
    setSelectedReqs(prev =>
      prev.includes(req) ? prev.filter(r => r !== req) : [...prev, req]
    );
  };

  const getExportData = () => {
    return {
      location,
      projectTitle,
      productionCompany,
      lineProducerName,
      contactPhone,
      shootStartDate,
      shootEndDate,
      shiftType,
      numberOfShifts,
      crewCount,
      specialRequirements: selectedReqs,
      customNotes,
      ratingAverage: ratingSummary.reviewCount > 0 ? ratingSummary.averageRating : undefined,
      reviewCount: ratingSummary.reviewCount > 0 ? ratingSummary.reviewCount : undefined
    };
  };

  const handleExportPdf = () => {
    setIsExporting(true);
    try {
      downloadLocationBookingPdf(getExportData());
    } catch (err) {
      console.error('Failed to export PDF', err);
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  const handleOpenPdfPreview = () => {
    try {
      openLocationBookingPdfInNewTab(getExportData());
    } catch (err) {
      console.error('Failed to preview PDF', err);
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = `CK-BK-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingRefId(ref);
    setIsConfirmed(true);
    if (location) {
      recordLocationBooking({
        location,
        projectTitle,
        productionCompany,
        lineProducerName,
        shootStartDate,
        shootEndDate,
        shiftType,
        numberOfShifts,
        bookingRef: ref,
      });
    }
  };

  return (
    <div
      id="location-booking-modal-backdrop"
      className="fixed inset-0 z-[1050] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="location-booking-modal-dialog"
        className="relative w-full max-w-2xl rounded-3xl bg-[#12141f] border border-white/15 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#161825] border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <span className="p-2 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 text-rose-400 border border-rose-500/30 shrink-0">
              <Calendar className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-cinematic truncate text-white">
                  Location Booking & Production Planning
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider shrink-0">
                  {location.category_name}
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate">
                {location.title} • {location.city}, {location.district}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Export PDF Button in Header */}
            <button
              id="header-export-location-pdf-btn"
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Export location booking details into a formatted PDF for production planning"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
            </button>

            <button
              id="close-location-booking-modal-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        {isConfirmed ? (
          <div className="p-8 text-center space-y-5 overflow-y-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold text-amber-400 tracking-wider">
                BOOKING INQUIRY REGISTERED
              </span>
              <h3 className="text-xl font-bold font-cinematic text-white">
                Shoot Shift Planned for {location.title}
              </h3>
              <p className="text-xs text-zinc-300 max-w-md mx-auto">
                Reference ID: <strong className="text-white font-mono">{bookingRefId}</strong>. The property custodian and production desk have been notified.
              </p>
            </div>

            {/* Formatted PDF Export CTA Card */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <FileDown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Download Official Production Planning PDF Dossier
                  </h4>
                  <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                    Generate the complete 2-page production specification with technical set parameters, police/panchayat clearance checklists, caretaker hotlines, and sign-off blocks.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                <button
                  id="confirm-screen-export-pdf-btn"
                  type="button"
                  onClick={handleExportPdf}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-950/40 active:scale-95"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Formatted PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenPdfPreview}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open PDF Preview</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmBooking} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
            {/* Top Quick Highlights Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-black/40 border border-white/10 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-400 block">Tariff Rate</span>
                <span className="font-bold text-rose-300">{location.pricing_text || '₹40,000 / Day'}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-400 block">Max Crew</span>
                <span className="font-bold text-emerald-300">{location.crew_capacity} Members</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-400 block">Generator Space</span>
                <span className="font-bold text-amber-300">{location.generator_access ? 'Available' : 'Mobile Required'}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-400 block">Custodian Phone</span>
                <span className="font-bold text-sky-300">{location.owner_contact_private || '+91 94471 88990'}</span>
              </div>
            </div>

            {/* Production Project Information */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
                  <span>Production Project & Crew In-Charge</span>
                </h3>
                <span className="text-[10px] text-zinc-500">Included in exported PDF</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                    Movie / Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. Bilal / Empuraan / Commercial Ad"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                    Production Banner / Studio *
                  </label>
                  <input
                    type="text"
                    required
                    value={productionCompany}
                    onChange={(e) => setProductionCompany(e.target.value)}
                    placeholder="e.g. Aashirvad Cinemas / Wayfarer Films"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                    Line Producer / Production Manager
                  </label>
                  <input
                    type="text"
                    value={lineProducerName}
                    onChange={(e) => setLineProducerName(e.target.value)}
                    placeholder="e.g. Antony Perumbavoor"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 94470 12345"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Schedule & Shifts */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Shoot Schedule & Shift Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                    Schedule Start Date
                  </label>
                  <input
                    type="date"
                    value={shootStartDate}
                    onChange={(e) => setShootStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                    Schedule End Date
                  </label>
                  <input
                    type="date"
                    value={shootEndDate}
                    onChange={(e) => setShootEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                    Planned Shifts
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={numberOfShifts}
                    onChange={(e) => setNumberOfShifts(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                    Shift Type
                  </label>
                  <select
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1a1c29] border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
                  >
                    <option value="Day Shift (06:00 AM - 06:00 PM)">Day Shift (06:00 AM - 06:00 PM)</option>
                    <option value="Night Shift (06:00 PM - 06:00 AM)">Night Shift (06:00 PM - 06:00 AM)</option>
                    <option value="Continuous 24-Hour Schedule">Continuous 24-Hour Schedule</option>
                    <option value="Golden Hour Split Shift (05:00-10:00 & 16:00-20:00)">Golden Hour Split Shift</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                    Crew Headcount
                  </label>
                  <input
                    type="number"
                    value={crewCount}
                    onChange={(e) => setCrewCount(parseInt(e.target.value) || 1)}
                    max={location.crew_capacity || 200}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Special Requirements Checklist */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                Technical Set Requirements (Printed on Planning Sheet)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMMON_REQUIREMENTS.map((req) => {
                  const isChecked = selectedReqs.includes(req);
                  return (
                    <label
                      key={req}
                      className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleReq(req)}
                        className="mt-0.5 rounded text-amber-500 focus:ring-amber-400 bg-zinc-900 border-white/20"
                      />
                      <span className="text-[11px] leading-tight">{req}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Production Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                Line Producer / Art Department Notes
              </label>
              <textarea
                rows={2}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Need to build temporary wooden arch in courtyard; camera cranes arrive at 4:30 AM."
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            {/* Clearances Info Box */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-zinc-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block mb-0.5">
                  KSFDC Single Window Clearance & Police NOC Integration
                </strong>
                The exported PDF includes government statutory checklists (Panchayat, Circle Inspector police intimation, high-tension electric safety, and fire safety) ready for official production lodgment.
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Export PDF Button (Prominent) */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  id="export-location-booking-pdf-btn"
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isExporting}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-950/40 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  title="Export complete location booking details into a formatted PDF document"
                >
                  <FileDown className="w-4 h-4" />
                  <span>{isExporting ? 'Generating PDF...' : 'Export PDF for Production Planning'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenPdfPreview}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                  title="Open formatted PDF preview in new tab"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              {/* Confirm / Close Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  Submit Inquiry
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

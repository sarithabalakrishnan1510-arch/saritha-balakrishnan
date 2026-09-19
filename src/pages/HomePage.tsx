import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Clapperboard, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Building2, 
  MapPin, 
  ArrowRight, 
  Video, 
  CheckCircle2, 
  AlertTriangle,
  Film,
  Camera,
  Truck,
  Heart,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../lib/store/appStore';
import { CastingCard } from '../components/casting/CastingCard';
import { TalentCard } from '../components/talent/TalentCard';
import { ApplyModal } from '../components/casting/ApplyModal';
import { IndustryUpdatesSection } from '../components/news/IndustryUpdatesSection';
import { CastingRole, TalentProfile } from '../types';

export const HomePage: React.FC = () => {
  const { castingCalls, talents, vendors, locations, castingRoles, currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'casting' | 'talent' | 'vendors'>('all');
  const [selectedRoleForApply, setSelectedRoleForApply] = useState<CastingRole | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    if (location.hash === '#industry-updates') {
      const el = document.getElementById('industry-updates');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.hash]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchType === 'talent') {
      navigate(`/talent?q=${encodeURIComponent(searchQuery)}`);
    } else if (searchType === 'vendors') {
      navigate(`/services?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/casting?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleApplyClick = (role: CastingRole) => {
    setSelectedRoleForApply(role);
    setIsApplyModalOpen(true);
  };

  // Top published casting calls
  const featuredCalls = castingCalls.filter(c => c.status === 'published' && c.admin_status === 'approved').slice(0, 4);

  // Spotlight Talents
  const spotlightTalents = talents.filter(t => t.verification_status === 'verified').slice(0, 4);

  return (
    <div className="space-y-16 pb-20">
      {/* Cinematic Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#10121a] via-[#0d0e14] to-[#090a0d] pt-12 pb-20 border-b border-white/10">
        {/* Background ambient lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-rose-600/10 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            {/* Pill tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Official Mollywood Casting & Production Network</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-cinematic tracking-tight leading-tight">
              Talent. Casting. Crew. <br />
              <span className="bg-gradient-to-r from-rose-400 via-amber-200 to-rose-400 bg-clip-text text-transparent">
                One Malayalam Cinema Network.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              Connect verified actors, child artists, production houses, and crew across all 14 districts of Kerala. Free from audition scams and hidden agency commissions.
            </p>

            {/* Unified Search Box */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 max-w-2xl mx-auto p-2 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-xl border border-white/10 w-full sm:w-auto">
                <select
                  value={searchType}
                  onChange={e => setSearchType(e.target.value as any)}
                  className="bg-transparent text-xs text-white focus:outline-none py-1.5"
                >
                  <option value="all" className="bg-zinc-900">All Categories</option>
                  <option value="casting" className="bg-zinc-900">Casting Calls</option>
                  <option value="talent" className="bg-zinc-900">Actors / Registry</option>
                  <option value="vendors" className="bg-zinc-900">Crew & Vendors</option>
                </select>
              </div>

              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search roles, characters, child artists, camera gear, locations..."
                  className="w-full bg-transparent pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs text-zinc-400">
              <span className="text-zinc-500">Popular:</span>
              <Link to="/casting?category=lead" className="hover:text-rose-300 underline">
                Lead Actors
              </Link>
              <span>•</span>
              <Link to="/talent?category=child_artist" className="hover:text-rose-300 underline text-amber-300">
                Child Artists (Guardian Consent)
              </Link>
              <span>•</span>
              <Link to="/casting?district=Ernakulam" className="hover:text-rose-300 underline">
                Kochi Shoots
              </Link>
              <span>•</span>
              <Link to="/services?category=camera_rental" className="hover:text-rose-300 underline">
                Alexa 35 Rentals
              </Link>
            </div>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
            <div className="text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-cinematic">100%</span>
              <p className="text-xs text-zinc-400">Zero Audition Fees</p>
            </div>
            <div className="text-center space-y-1 border-l border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-cinematic">14</span>
              <p className="text-xs text-zinc-400">Kerala Districts Covered</p>
            </div>
            <div className="text-center space-y-1 border-l border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-cinematic">12,500+</span>
              <p className="text-xs text-zinc-400">Registered Talent Profiles</p>
            </div>
            <div className="text-center space-y-1 border-l border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-cinematic">350+</span>
              <p className="text-xs text-zinc-400">Verified Productions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Primary 3 Portals Action Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Talent Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161822] to-[#101117] border border-rose-500/20 hover:border-rose-500/50 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-cinematic">For Actors & Artists</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Build your verified digital portfolio with headshots, showreels, and dialect capabilities. Get matched with roles based on playing age and Malayalam accents.
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/talent/dashboard"
                className="inline-flex items-center gap-2 text-xs font-semibold text-rose-400 group-hover:text-rose-300"
              >
                <span>Launch Talent Hub</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Production Houses Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161822] to-[#101117] border border-amber-500/20 hover:border-amber-500/50 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-cinematic">For Production Houses</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Post casting calls, filter through verified talent using multi-parameter matching, manage applicant pipelines in a Kanban board, and invite for screen tests.
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/production/dashboard"
                className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 group-hover:text-amber-300"
              >
                <span>Production Pipeline</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Vendors & Locations Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161822] to-[#101117] border border-emerald-500/20 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-cinematic">Crew, Gear & Locations</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Connect with cinema camera rentals, sound units, vanity vans, stunt guilds, and authentic Kerala heritage houses, tea plantations, and backwater villas.
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300"
              >
                <span>Browse Directory</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Casting Calls Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-1">
              Active Productions
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-cinematic tracking-tight">
              Open Casting Calls
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Direct auditions from vetted Malayalam feature films, OTT originals, and television networks.
            </p>
          </div>

          <Link
            to="/casting"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
          >
            <span>View All Casting Calls ({castingCalls.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredCalls.map(call => (
            <CastingCard
              key={call.id}
              castingCall={call}
              onApplyClick={handleApplyClick}
            />
          ))}
        </div>
      </section>

      {/* Spotlight Talent Registry Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-1">
              Verified Mollywood Registry
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-cinematic tracking-tight">
              Spotlight Talents
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Trained theatre actors, fresh discoveries, character performers, and child artists across Kerala.
            </p>
          </div>

          <Link
            to="/talent"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
          >
            <span>Explore All Talents ({talents.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {spotlightTalents.map(talent => (
            <TalentCard key={talent.id} talent={talent} />
          ))}
        </div>
      </section>

      {/* Industry Updates & Malayalam Film Press Releases Section */}
      <IndustryUpdatesSection />

      {/* Production Services & Shooting Locations Highlight Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#14161f] to-[#0d0e13] border border-white/10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                Logistics & Infrastructure
              </span>
              <h2 className="text-2xl font-bold text-white font-cinematic tracking-tight">
                Camera Units, Vanity Vans & Shooting Locations
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/services"
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                All 20 Services →
              </Link>
              <Link
                to="/locations"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                All 10 Locations →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample Vendor 1 */}
            {vendors.slice(0, 3).map(vend => (
              <div
                key={vend.id}
                className="rounded-xl bg-black/40 border border-white/10 p-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <img
                    src={vend.image_url}
                    alt={vend.business_name}
                    className="w-full h-36 object-cover rounded-lg mb-3"
                  />
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold uppercase">
                    {vend.category_name}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">{vend.business_name}</h4>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{vend.description}</p>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">{vend.district}</span>
                  <Link
                    to="/services"
                    className="text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Anti-Fraud Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-rose-950/20 border border-rose-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>KERALA FILM CHAMBER SAFETY CHARTER</span>
            </div>
            <h3 className="text-2xl font-bold text-white font-cinematic">
              Protecting Aspiring Talents & Minors Across Kerala
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Never pay registration fees, security deposits, or advance portfolio money for auditions. Genuine casting directors never charge actors. If you encounter any solicitations, report immediately for swift moderation review.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/safety"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-md text-center"
            >
              Read Safety Protocol
            </Link>
            <Link
              to="/safety#report"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors text-center"
            >
              Report Fraudulent Call
            </Link>
          </div>
        </div>
      </section>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        role={selectedRoleForApply}
        castingCall={castingCalls.find(c => c.id === selectedRoleForApply?.casting_call_id)}
      />
    </div>
  );
};

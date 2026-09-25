import React from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard, ShieldCheck, Heart, MapPin, Mail, Phone, AlertCircle } from 'lucide-react';
import { KERALA_DISTRICTS } from '../../lib/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#060709] border-t border-amber-500/20 text-zinc-400 text-sm mt-auto">
      {/* Top Banner: Child safety & Zero Scam guarantee in Black & Gold */}
      <div className="border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-[#0e0f14] to-amber-950/40 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-amber-300">Mollywood Safety Protocol:</strong> Cast Kerala strictly prohibits audition fees or registration deposits. All child artists require verified guardian consent.
            </span>
          </div>
          <Link
            to="/safety"
            className="text-amber-400 hover:text-amber-300 underline font-medium whitespace-nowrap"
          >
            Read Industry Safety Guidelines
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center border border-amber-300/60 shadow-lg shadow-amber-500/20">
                <Clapperboard className="w-5 h-5 text-zinc-950 stroke-[2.2]" />
              </div>
              <span className="text-xl font-bold font-cinematic bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent tracking-wide">
                CAST KERALA
              </span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              Talent. Casting. Crew. Locations. One Industry Network. Connecting Malayalam cinema, OTT, television serials, micro-dramas, and commercial productions across all 14 districts of Kerala.
            </p>
            <div className="pt-2 text-xs space-y-1 text-zinc-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400/80" />
                <span>Kerala Film Chamber Complex, MG Road, Ernakulam, Kerala 682035</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400/80" />
                <span>support@castkerala.org • helpline@castkerala.org</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-amber-300 text-xs font-bold uppercase tracking-wider">
              Network
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/casting" className="hover:text-amber-300 transition-colors">
                  Open Casting Calls
                </Link>
              </li>
              <li>
                <Link to="/talent" className="hover:text-amber-300 transition-colors">
                  Talent Registry
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-amber-300 transition-colors">
                  Production Services & Crew
                </Link>
              </li>
              <li>
                <Link to="/locations" className="hover:text-amber-300 transition-colors">
                  Shooting Locations
                </Link>
              </li>
              <li>
                <Link to="/list-service" className="hover:text-amber-200 transition-colors text-amber-400 font-semibold">
                  List Your Service / Gear
                </Link>
              </li>
            </ul>
          </div>

          {/* Production & Talent */}
          <div className="space-y-3">
            <h3 className="text-amber-300 text-xs font-bold uppercase tracking-wider">
              Portals
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/talent/dashboard" className="hover:text-amber-300 transition-colors">
                  Talent Hub & Matches
                </Link>
              </li>
              <li>
                <Link to="/production/dashboard" className="hover:text-amber-300 transition-colors">
                  Production Pipeline
                </Link>
              </li>
              <li>
                <Link to="/production/casting/new" className="hover:text-amber-300 transition-colors">
                  Post New Casting Call
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-amber-300 transition-colors">
                  Moderation Desk
                </Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-amber-300 transition-colors">
                  Report Suspicious Casting
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Safety */}
          <div className="space-y-3">
            <h3 className="text-amber-300 text-xs font-bold uppercase tracking-wider">
              Trust & Legal
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/safety" className="hover:text-amber-300 transition-colors">
                  Child Artist Safety Code
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-amber-300 transition-colors">
                  Private Contact Masking
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-amber-300 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-300 transition-colors">
                  About Cast Kerala
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-300 transition-colors">
                  Contact Grievance Officer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Kerala Districts Pills */}
        <div className="mt-10 pt-6 border-t border-amber-500/15">
          <p className="text-[11px] text-zinc-500 mb-2 font-medium">Production Network Across Kerala Districts:</p>
          <div className="flex flex-wrap gap-1.5">
            {KERALA_DISTRICTS.map(district => (
              <Link
                key={district}
                to={`/talent?district=${encodeURIComponent(district)}`}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 hover:bg-amber-500/10 hover:text-amber-300 border border-white/5 hover:border-amber-500/30 text-zinc-400 transition-all"
              >
                {district}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <p>© {new Date().getFullYear()} CAST KERALA. Dedicated to the Malayalam Entertainment & Film Industry.</p>
          <p className="flex items-center gap-1 text-amber-400/80">
            Built with respect for the craft of Mollywood cinema.
          </p>
        </div>
      </div>
    </footer>
  );
};

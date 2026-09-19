import React from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard, ShieldCheck, Heart, MapPin, Mail, Phone, AlertCircle } from 'lucide-react';
import { KERALA_DISTRICTS } from '../../lib/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#090a0c] border-t border-white/10 text-zinc-400 text-sm mt-auto">
      {/* Top Banner: Child safety & Zero Scam guarantee */}
      <div className="border-b border-white/5 bg-rose-950/20 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Mollywood Safety Protocol:</strong> Cast Kerala strictly prohibits audition fees or registration deposits. All child artists require verified guardian consent.
            </span>
          </div>
          <Link
            to="/safety"
            className="text-rose-400 hover:text-rose-300 underline font-medium whitespace-nowrap"
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
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-600 to-rose-900 flex items-center justify-center border border-rose-500/30">
                <Clapperboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-cinematic text-white tracking-wide">
                CAST KERALA
              </span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              Talent. Casting. Crew. Locations. One Industry Network. Connecting Malayalam cinema, OTT, television serials, micro-dramas, and commercial productions across all 14 districts of Kerala.
            </p>
            <div className="pt-2 text-xs space-y-1 text-zinc-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>Kerala Film Chamber Complex, MG Road, Ernakulam, Kerala 682035</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>support@castkerala.org • helpline@castkerala.org</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-white text-xs font-semibold uppercase tracking-wider">
              Network
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/casting" className="hover:text-white transition-colors">
                  Open Casting Calls
                </Link>
              </li>
              <li>
                <Link to="/talent" className="hover:text-white transition-colors">
                  Talent Registry
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Production Services & Crew
                </Link>
              </li>
              <li>
                <Link to="/locations" className="hover:text-white transition-colors">
                  Shooting Locations
                </Link>
              </li>
              <li>
                <Link to="/list-service" className="hover:text-white transition-colors text-rose-400">
                  List Your Service / Gear
                </Link>
              </li>
            </ul>
          </div>

          {/* Production & Talent */}
          <div className="space-y-3">
            <h3 className="text-white text-xs font-semibold uppercase tracking-wider">
              Portals
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/talent/dashboard" className="hover:text-white transition-colors">
                  Talent Hub & Matches
                </Link>
              </li>
              <li>
                <Link to="/production/dashboard" className="hover:text-white transition-colors">
                  Production Pipeline
                </Link>
              </li>
              <li>
                <Link to="/production/casting/new" className="hover:text-white transition-colors">
                  Post New Casting Call
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Moderation Desk
                </Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-white transition-colors">
                  Report Suspicious Casting
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Safety */}
          <div className="space-y-3">
            <h3 className="text-white text-xs font-semibold uppercase tracking-wider">
              Trust & Legal
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/safety" className="hover:text-white transition-colors">
                  Child Artist Safety Code
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Private Contact Masking
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Cast Kerala
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Grievance Officer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Kerala Districts Pills */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <p className="text-[11px] text-zinc-500 mb-2">Production Network Across Kerala Districts:</p>
          <div className="flex flex-wrap gap-1.5">
            {KERALA_DISTRICTS.map(district => (
              <Link
                key={district}
                to={`/talent?district=${encodeURIComponent(district)}`}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {district}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <p>© {new Date().getFullYear()} CAST KERALA. Dedicated to the Malayalam Entertainment & Film Industry.</p>
          <p className="flex items-center gap-1">
            Built with respect for the craft of cinema.
          </p>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Heart
} from 'lucide-react';
import { CastingCall, CastingRole } from '../../types';
import { useApp } from '../../lib/store/appStore';
import { useFavorites } from '../../lib/store/favoritesStore';
import { calculateRoleMatchScore } from '../../lib/matching/engine';
import { ShareButton } from '../common/ShareButton';

interface CastingCardProps {
  castingCall: CastingCall;
  onApplyClick?: (role: CastingRole) => void;
  showMatchBadge?: boolean;
}

export const CastingCard: React.FC<CastingCardProps> = ({ 
  castingCall, 
  onApplyClick,
  showMatchBadge = true 
}) => {
  const { currentTalent, castingRoles } = useApp();
  const { isFavoriteCasting, toggleFavoriteCasting } = useFavorites();
  const [expanded, setExpanded] = useState(false);

  const isSaved = isFavoriteCasting(castingCall.id);

  const roles = castingRoles.filter(r => r.casting_call_id === castingCall.id);

  // If talent logged in, compute highest match score among roles
  let highestMatch: { score: number; level: string; roleName: string } | null = null;
  if (currentTalent && roles.length > 0) {
    for (const r of roles) {
      const result = calculateRoleMatchScore(r, currentTalent);
      if (!highestMatch || result.totalScore > highestMatch.score) {
        highestMatch = {
          score: result.totalScore,
          level: result.matchLevel,
          roleName: r.role_name,
        };
      }
    }
  }

  const isDeadlinePassed = new Date(castingCall.application_deadline).getTime() < Date.now();

  return (
    <div className="rounded-xl bg-[#13141a] border border-white/10 hover:border-rose-500/40 transition-all p-5 shadow-lg flex flex-col justify-between group">
      <div>
        {/* Top bar: Company & Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
              <Building2 className="w-3.5 h-3.5" />
              {castingCall.company_name || 'Production House'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Verified Production
            </span>
            {castingCall.has_safety_flag && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Safety Under Review
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Smart Match Tag if Talent */}
            {showMatchBadge && highestMatch && (
              <div className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${
                highestMatch.score >= 90
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : highestMatch.score >= 70
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-zinc-800 text-zinc-300 border border-white/10'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{highestMatch.score}% Match</span>
              </div>
            )}

            {/* Native Share Button */}
            <ShareButton
              title={castingCall.title}
              url={`/casting/${castingCall.id}`}
              description={castingCall.description}
              type="casting"
              variant="icon"
              size="md"
            />

            {/* Favorite Button */}
            <button
              id={`fav-btn-${castingCall.id}`}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavoriteCasting(castingCall.id, castingCall.title);
              }}
              className={`p-1.5 rounded-lg border transition-all ${
                isSaved 
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' 
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title={isSaved ? 'Remove from saved list' : 'Save to personal list'}
              aria-label={isSaved ? 'Remove from saved list' : 'Save to personal list'}
            >
              <Heart className={`w-4 h-4 transition-transform active:scale-75 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <Link to={`/casting/${castingCall.id}`} className="group-hover:text-rose-400 transition-colors">
          <h3 className="text-lg font-bold text-white tracking-tight mb-2">
            {castingCall.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed mb-4">
          {castingCall.description}
        </p>

        {/* Roles overview pill list */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              Open Roles ({roles.length})
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-0.5"
            >
              {expanded ? 'Hide Details' : 'View Roles'}
            </button>
          </div>

          <div className="space-y-2">
            {(expanded ? roles : roles.slice(0, 2)).map(role => (
              <div 
                key={role.id} 
                className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200">{role.role_name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">
                      Age {role.playing_age_min}–{role.playing_age_max}
                    </span>
                    <span className="text-[10px] capitalize text-rose-300">
                      {role.gender_requirement}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-3 mt-1">
                    <span>{role.compensation_text || 'Paid scale'}</span>
                    <span>•</span>
                    <span>{role.shoot_location || 'Kerala'}</span>
                  </div>
                </div>

                {onApplyClick && (
                  <button
                    onClick={() => onApplyClick(role)}
                    className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs whitespace-nowrap transition-colors"
                  >
                    Apply
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-1 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
          <span>Deadline: </span>
          <span className={isDeadlinePassed ? 'text-red-400 font-semibold' : 'text-zinc-200'}>
            {new Date(castingCall.application_deadline).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ShareButton
            title={castingCall.title}
            url={`/casting/${castingCall.id}`}
            description={castingCall.description}
            type="casting"
            variant="card-action"
            label="Share"
            className="px-2 py-1 text-[11px]"
          />
          <Link
            to={`/casting/${castingCall.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300"
          >
            <span>Full Details</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  Video, 
  Calendar, 
  UserCheck,
  Languages,
  Award
} from 'lucide-react';
import { TalentProfile } from '../../types';
import { useApp } from '../../lib/store/appStore';

interface TalentCardProps {
  talent: TalentProfile;
  onInviteAudition?: (talent: TalentProfile) => void;
  onToggleShortlist?: (talent: TalentProfile) => void;
  isShortlisted?: boolean;
}

export const TalentCard: React.FC<TalentCardProps> = ({
  talent,
  onInviteAudition,
  onToggleShortlist,
  isShortlisted = false,
}) => {
  const { currentUser } = useApp();

  const isProduction = currentUser?.role === 'production';
  const isChildArtist = talent.is_child_artist || talent.experience_level === 'child_artist' || (talent.actual_age < 18);
  const city = talent.city || talent.user?.city || 'Kerala';
  const district = talent.district || talent.user?.district || '';
  const languages = talent.languages || [];
  const skills = talent.skills || [];

  return (
    <div className="rounded-xl bg-[#13151c] border border-white/10 hover:border-rose-500/40 transition-all overflow-hidden shadow-lg flex flex-col justify-between group">
      <div>
        {/* Photo Container with overlays */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
          <img
            src={
              talent.user?.avatar_url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&fit=crop'
            }
            alt={talent.stage_name || talent.user?.full_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13151c] via-transparent to-black/30" />

          {/* Badges Top Bar */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1.5 items-start">
              {talent.verification_status === 'verified' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Talent
                </span>
              )}
              {isChildArtist && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-white backdrop-blur-md shadow-sm">
                  <UserCheck className="w-3 h-3" />
                  Child Artist (Verified Guardian)
                </span>
              )}
            </div>

            {isProduction && onToggleShortlist && (
              <button
                onClick={() => onToggleShortlist(talent)}
                title={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                className={`p-2 rounded-full backdrop-blur-md shadow-md transition-colors ${
                  isShortlisted
                    ? 'bg-rose-600 text-white'
                    : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80'
                }`}
              >
                {isShortlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Bottom Photo Overlay Info */}
          <div className="absolute bottom-3 left-3 right-3">
            <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-600/90 text-white mb-1 shadow-sm">
              {talent.primary_category}
            </span>
            <h3 className="text-base font-bold text-white leading-tight drop-shadow-md">
              {talent.stage_name || talent.user?.full_name}
            </h3>
            {talent.stage_name && talent.user?.full_name && talent.stage_name !== talent.user.full_name && (
              <span className="text-[11px] text-zinc-300 drop-shadow-sm block">
                ({talent.user.full_name})
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3 text-xs">
          {/* Age & Location stats */}
          <div className="flex items-center justify-between text-zinc-300 pt-1 border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-1 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{city}, {district}</span>
            </div>
            <span className="text-[11px] font-medium text-zinc-400">
              Playing Age {talent.playing_age_min}–{talent.playing_age_max}
            </span>
          </div>

          {/* Physical & Experience metrics */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
            {talent.height_cm && (
              <div>
                <span className="text-zinc-500">Height:</span>{' '}
                <span className="text-zinc-300 font-medium">{talent.height_cm} cm</span>
              </div>
            )}
            <div>
              <span className="text-zinc-500">Level:</span>{' '}
              <span className="text-zinc-300 font-medium capitalize">{talent.experience_level.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Languages */}
          {languages.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Languages className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              {languages.slice(0, 3).map(lang => (
                <span
                  key={lang}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-300"
                >
                  {lang}
                </span>
              ))}
            </div>
          )}

          {/* Key Skills chips */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 3).map(skill => (
                <span
                  key={skill}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 3 && (
                <span className="text-[10px] px-1.5 py-0.5 text-zinc-500">
                  +{skills.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0 border-t border-white/5 mt-2 flex items-center gap-2">
        <Link
          to={`/talent/${talent.id}`}
          className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs text-center transition-colors"
        >
          View Portfolio
        </Link>
        {isProduction && onInviteAudition && (
          <button
            onClick={() => onInviteAudition(talent)}
            className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-1 transition-colors"
            title="Invite to Audition"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Audition</span>
          </button>
        )}
      </div>
    </div>
  );
};

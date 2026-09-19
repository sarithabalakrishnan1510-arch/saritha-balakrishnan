import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  UserCheck, 
  MapPin, 
  Calendar, 
  Languages, 
  Film, 
  Award, 
  Video, 
  ArrowLeft, 
  Bookmark, 
  BookmarkCheck, 
  Lock, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../lib/store/appStore';

export const TalentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { talents, currentUser, shortlists, toggleShortlistTalent, createShortlist } = useApp();

  const talent = talents.find(t => t.id === id || t.user_id === id);

  if (!talent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Talent Profile Not Found</h2>
        <p className="text-zinc-400 text-xs">The requested actor profile does not exist or has been made private.</p>
        <Link to="/talent" className="inline-block px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold">
          Return to Talent Registry
        </Link>
      </div>
    );
  }

  const activeShortlist = shortlists[0] || null;
  const isShortlisted = activeShortlist?.talent_ids.includes(talent.user_id);

  const handleToggleShortlist = () => {
    if (!currentUser || currentUser.role !== 'production') return;
    if (activeShortlist) {
      toggleShortlistTalent(activeShortlist.id, talent.user_id);
    } else {
      createShortlist('Production Shortlist', [talent.user_id]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Directory</span>
      </button>

      {/* Main Profile Header Card */}
      <div className="rounded-2xl bg-[#12141c] border border-white/10 overflow-hidden shadow-2xl">
        {/* Banner header image */}
        <div className="h-44 w-full bg-gradient-to-r from-rose-950/80 via-zinc-900 to-black relative">
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          {/* Avatar floating over banner */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-20 mb-6">
            <div className="flex items-end gap-5">
              <img
                src={
                  talent.user?.avatar_url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&fit=crop'
                }
                alt={talent.stage_name || talent.user?.full_name}
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl object-cover ring-4 ring-[#12141c] shadow-2xl bg-zinc-900"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white font-cinematic">
                    {talent.stage_name || talent.user?.full_name}
                  </h1>
                  {talent.verification_status === 'verified' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                  {talent.is_child_artist && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <UserCheck className="w-3.5 h-3.5" />
                      Child Artist
                    </span>
                  )}
                </div>
                {talent.stage_name && talent.user?.full_name && (
                  <p className="text-xs text-zinc-400">Legal Name: {talent.user.full_name}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-zinc-300 pt-1">
                  <span className="text-rose-400 font-semibold">{talent.primary_category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    {talent.city}, {talent.district}
                  </span>
                </div>
              </div>
            </div>

            {/* Production Actions */}
            {currentUser?.role === 'production' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleShortlist}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                    isShortlisted
                      ? 'bg-rose-600 text-white'
                      : 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
                  }`}
                >
                  {isShortlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  <span>{isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}</span>
                </button>
                <Link
                  to={`/production/dashboard?inviteTalent=${talent.user_id}`}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Video className="w-4 h-4" />
                  <span>Invite to Audition</span>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-black/40 border border-white/5 text-xs">
            <div>
              <span className="text-zinc-500 block text-[11px]">Playing Age Range</span>
              <span className="text-white font-semibold text-sm">
                {talent.playing_age_min} – {talent.playing_age_max} yrs
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[11px]">Height & Physical</span>
              <span className="text-white font-semibold text-sm">
                {talent.height_cm ? `${talent.height_cm} cm` : 'Not specified'}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[11px]">Working Availability</span>
              <span className="text-emerald-400 font-semibold text-sm capitalize">
                {talent.working_status.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[11px]">Experience Level</span>
              <span className="text-white font-semibold text-sm capitalize">
                {talent.experience_level}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Bio, Languages, Skills & Media */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio & Artistic Statement */}
          <div className="rounded-2xl bg-[#12141c] border border-white/10 p-6 space-y-3">
            <h3 className="text-base font-bold text-white font-cinematic flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>Biography & Background</span>
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
              {talent.bio || 'No public bio provided yet.'}
            </p>
          </div>

          {/* Languages & Malayalam Dialects */}
          <div className="rounded-2xl bg-[#12141c] border border-white/10 p-6 space-y-3">
            <h3 className="text-base font-bold text-white font-cinematic flex items-center gap-2">
              <Languages className="w-4 h-4 text-rose-400" />
              <span>Languages & Dialects</span>
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {(talent.languages || []).map(lang => (
                <span
                  key={lang}
                  className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-200 font-medium"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Experience & Past Filmography */}
          <div className="rounded-2xl bg-[#12141c] border border-white/10 p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-cinematic flex items-center gap-2">
              <Film className="w-4 h-4 text-rose-400" />
              <span>Screen & Stage Credits</span>
            </h3>
            {(!talent.experience || talent.experience.length === 0) ? (
              <p className="text-xs text-zinc-500 italic">No past credits logged.</p>
            ) : (
              <div className="space-y-3 divide-y divide-white/5">
                {(talent.experience || []).map(exp => (
                  <div key={exp.id} className="pt-3 first:pt-0 flex items-start justify-between gap-4 text-xs">
                    <div>
                      <h4 className="font-bold text-white">{exp.title}</h4>
                      <p className="text-rose-300 font-medium text-[11px]">Role: {exp.role_name}</p>
                      {exp.director && (
                        <p className="text-zinc-400 text-[11px]">Director: {exp.director}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-zinc-400 text-[10px] font-mono">
                        {exp.year || 'Released'}
                      </span>
                      <span className="block text-[10px] text-zinc-500 capitalize mt-1">
                        {exp.project_type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Media / Photos */}
          <div className="rounded-2xl bg-[#12141c] border border-white/10 p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-cinematic">
              Photos & Headshots ({(talent.media || []).length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(talent.media || []).map((item, idx) => (
                <div key={item.id || idx} className="rounded-xl overflow-hidden bg-black/60 border border-white/10 aspect-[3/4] relative group">
                  <img
                    src={item.media_url}
                    alt={item.caption || 'Talent photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {item.caption && (
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-black/80 text-[10px] text-zinc-300 truncate">
                      {item.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Skills, Guardian Safety, Protected Contact */}
        <div className="space-y-6">
          {/* Showreel / Video Link */}
          {talent.showreel_url && (
            <div className="rounded-2xl bg-[#12141c] border border-white/10 p-5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-400" />
                <span>Video Showreel</span>
              </h4>
              <a
                href={talent.showreel_url}
                target="_blank"
                rel="noreferrer"
                className="block p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-semibold text-center transition-colors"
              >
                Watch Actor Showreel ↗
              </a>
            </div>
          )}

          {/* Specialized Skills */}
          <div className="rounded-2xl bg-[#12141c] border border-white/10 p-5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Specialized Skills</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(talent.skills || []).map(skill => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-200 text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Child Artist Guardian Safety Details */}
          {talent.is_child_artist && (
            <div className="rounded-2xl bg-amber-950/20 border border-amber-500/30 p-5 space-y-2 text-xs text-amber-200">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <UserCheck className="w-4 h-4" />
                <span>Child Artist Protection</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Registered under guardian: <strong>{talent.guardian_name || 'Verified Guardian'}</strong> ({talent.guardian_relationship || 'Parent'}).
              </p>
              <p className="text-[10px] text-amber-400/80">
                In compliance with Kerala POCSO & child labor guidelines, shoot call times for minors are limited to 5 hours daily with mandatory guardian presence.
              </p>
            </div>
          )}

          {/* Privacy & Contact Masking Box */}
          <div className="rounded-2xl bg-black/40 border border-white/10 p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-bold">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>Private Contact Masking</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Personal telephone numbers and residential addresses are concealed to protect artists against unverified solicitations. Official invitations are dispatched through verified production credentials.
            </p>
            {currentUser?.role === 'production' && (
              <div className="pt-2">
                <span className="text-[10px] text-emerald-400 font-semibold block">
                  ✓ Verified Production Privilege Active
                </span>
                <p className="text-[10px] text-zinc-400">
                  You may dispatch official casting invitations directly into this artist's dashboard.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

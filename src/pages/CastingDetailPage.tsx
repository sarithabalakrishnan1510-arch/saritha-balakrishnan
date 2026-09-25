import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  Video, 
  Share2, 
  ShieldAlert, 
  Clock,
  Briefcase,
  Heart
} from 'lucide-react';
import { useApp } from '../lib/store/appStore';
import { useFavorites } from '../lib/store/favoritesStore';
import { ApplyModal } from '../components/casting/ApplyModal';
import { MatchBreakdownModal } from '../components/casting/MatchBreakdownModal';
import { ReportModal } from '../components/admin/ReportModal';
import { CastingRole } from '../types';
import { calculateRoleMatchScore } from '../lib/matching/engine';
import { ShareButton } from '../components/common/ShareButton';

export const CastingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { castingCalls, castingRoles, projects, currentTalent, currentUser } = useApp();
  const { isFavoriteCasting, toggleFavoriteCasting } = useFavorites();

  const [selectedRoleForApply, setSelectedRoleForApply] = useState<CastingRole | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [breakdownRole, setBreakdownRole] = useState<CastingRole | null>(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const call = castingCalls.find(c => c.id === id);
  if (!call) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Casting Call Not Found</h2>
        <p className="text-zinc-400 text-xs">The casting notice may have expired or been archived.</p>
        <Link to="/casting" className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 text-xs font-bold shadow-md shadow-amber-950/40">
          Return to Casting Calls
        </Link>
      </div>
    );
  }

  const project = projects.find(p => p.id === call.project_id);
  const roles = castingRoles.filter(r => r.casting_call_id === call.id);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDeadlinePassed = new Date(call.application_deadline).getTime() < Date.now();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Casting List</span>
      </button>

      {/* Main Header Card */}
      <div className="rounded-2xl bg-[#12141c] border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <Building2 className="w-3.5 h-3.5" />
              {call.company_name || 'Production House'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Production
            </span>
            {call.has_safety_flag && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Under Safety Review
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id={`detail-fav-btn-${call.id}`}
              onClick={() => toggleFavoriteCasting(call.id, call.title)}
              className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors border ${
                isFavoriteCasting(call.id)
                  ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md shadow-amber-950/40 font-semibold'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border-white/10'
              }`}
              title={isFavoriteCasting(call.id) ? 'Remove from saved list' : 'Save to personal list'}
            >
              <Heart className={`w-4 h-4 ${isFavoriteCasting(call.id) ? 'fill-zinc-950 text-zinc-950' : 'text-zinc-400'}`} />
              <span>{isFavoriteCasting(call.id) ? 'Saved' : 'Save'}</span>
            </button>
            <ShareButton
              title={call.title}
              url={`/casting/${call.id}`}
              description={call.description}
              type="casting"
              variant="button"
              label="Share Call"
              className="p-2 text-xs rounded-lg"
            />
            <button
              onClick={() => setIsReportOpen(true)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs flex items-center gap-1.5 transition-colors border border-white/10"
              title="Report suspicious demands or fees"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Report</span>
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-cinematic tracking-tight">
            {call.title}
          </h1>
          {project && (
            <p className="text-xs text-amber-400 font-semibold mt-1">
              Project: {project.name} ({project.project_type.toUpperCase()}) • Directed by {project.director_name}
            </p>
          )}
        </div>

        {/* Synopsis / Description */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-300 leading-relaxed space-y-2">
          <span className="font-semibold text-white block">Project Overview:</span>
          <p>{call.description}</p>
        </div>

        {/* Shoot & Deadline metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-white/10 text-xs">
          <div>
            <span className="text-zinc-500 block">Application Deadline</span>
            <span className={`font-semibold ${isDeadlinePassed ? 'text-red-400' : 'text-white'}`}>
              {new Date(call.application_deadline).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block">Shoot Location</span>
            <span className="font-semibold text-white">{project?.primary_location || 'Kerala'}</span>
          </div>
          <div>
            <span className="text-zinc-500 block">Shoot Timeline</span>
            <span className="font-semibold text-white">
              {project?.shoot_start_date ? new Date(project.shoot_start_date).toLocaleDateString() : 'Upcoming'}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block">Audition Format</span>
            <span className="font-semibold text-emerald-400">Direct / Self-Tape</span>
          </div>
        </div>
      </div>

      {/* Safety Notice Strip */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-200">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-white block">Safe Casting Guarantee:</strong>
          <p className="text-zinc-300 text-[11px]">
            This casting call does not require any entry fees, script deposit, or casting agency registration charges. Any request for payment from callers should be reported immediately.
          </p>
        </div>
      </div>

      {/* Roles List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white font-cinematic">
            Character Roles Open for Audition ({roles.length})
          </h2>
          <span className="text-xs text-zinc-400">
            Submit directly to director & casting team
          </span>
        </div>

        <div className="space-y-4">
          {roles.map(role => {
            const match = currentTalent ? calculateRoleMatchScore(role, currentTalent) : null;

            return (
              <div
                key={role.id}
                className="rounded-xl bg-[#14161f] border border-white/10 p-5 hover:border-amber-400/40 transition-all space-y-4 shadow-lg"
              >
                {/* Role Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white">{role.role_name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                        Playing Age: {role.playing_age_min}–{role.playing_age_max}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-200 border border-amber-500/20 capitalize font-medium">
                        {role.gender_requirement}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                        {role.compensation_text || 'Standard union scale'}
                      </span>
                    </div>
                  </div>

                  {/* Smart Match Pill */}
                  {match && (
                    <div className="flex items-center gap-2">
                      <div className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 ${
                        match.totalScore >= 80
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : match.totalScore >= 60
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{match.totalScore}% Match</span>
                      </div>
                      <button
                        onClick={() => {
                          setBreakdownRole(role);
                          setIsBreakdownOpen(true);
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 underline"
                      >
                        Breakdown
                      </button>
                    </div>
                  )}
                </div>

                {/* Role description */}
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {role.role_description}
                </p>

                {/* Requirements Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5 text-xs text-zinc-400">
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Required Languages:</span>
                    <span className="text-white font-medium">{role.language_requirement.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Experience Level:</span>
                    <span className="text-white font-medium capitalize">{role.experience_requirement}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Shoot Location:</span>
                    <span className="text-white font-medium">{role.shoot_location}</span>
                  </div>
                </div>

                {/* Apply CTA Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                    {role.self_tape_required && (
                      <span className="flex items-center gap-1 text-amber-300">
                        <Video className="w-3.5 h-3.5" /> Self-tape optional/preferred
                      </span>
                    )}
                    {role.special_notes && (
                      <span className="italic text-zinc-500">Note: {role.special_notes}</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedRoleForApply(role);
                      setIsApplyOpen(true);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-950/40 transition-all flex items-center gap-2 active:scale-95"
                  >
                    <span>Apply for this Role</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        role={selectedRoleForApply}
        castingCall={call}
      />

      {/* Match Breakdown Modal */}
      <MatchBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        role={breakdownRole}
        talent={currentTalent}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="casting_call"
        targetId={call.id}
        targetTitle={call.title}
      />
    </div>
  );
};

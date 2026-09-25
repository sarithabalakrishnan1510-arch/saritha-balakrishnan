import React from 'react';
import { X, Sparkles, CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { CastingRole, TalentProfile } from '../../types';
import { calculateRoleMatchScore } from '../../lib/matching/engine';

interface MatchBreakdownModalProps {
  role: CastingRole | null;
  talent: TalentProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MatchBreakdownModal: React.FC<MatchBreakdownModalProps> = ({
  role,
  talent,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !role || !talent) return null;

  const match = calculateRoleMatchScore(role, talent);

  const criteria = [
    { name: 'Gender Fit', score: match.breakdown.genderScore, max: 20, desc: `Required: ${role.gender_requirement} | Profile: ${talent.gender}` },
    { name: 'Playing Age Range', score: match.breakdown.ageScore, max: 20, desc: `Role: ${role.playing_age_min}–${role.playing_age_max} | Playing: ${talent.playing_age_min}–${talent.playing_age_max}` },
    { name: 'Language & Dialect', score: match.breakdown.languageScore, max: 15, desc: role.language_requirement.join(', ') },
    { name: 'Experience Level', score: match.breakdown.experienceScore, max: 15, desc: `Need: ${role.experience_requirement} | Talent: ${talent.experience_level}` },
    { name: 'Location / District', score: match.breakdown.locationScore, max: 10, desc: `Shoot: ${role.shoot_location || 'Kerala'} | Base: ${talent.district || talent.user?.district || 'Kerala'}` },
    { name: 'Required Skills', score: match.breakdown.skillsScore, max: 10, desc: (talent.skills || []).slice(0, 4).join(', ') || 'None specified' },
    { name: 'Working Availability', score: match.breakdown.availabilityScore, max: 5, desc: `Current: ${talent.working_status}` },
    { name: 'Preferences & Terms', score: match.breakdown.preferenceScore, max: 5, desc: `${role.paid_status} role` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#0d0e14] border border-amber-500/30 p-6 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Cast Kerala Matching Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{role.role_name}</h2>
          <p className="text-xs text-zinc-400">Match analysis for {talent.user?.full_name}</p>
        </div>

        {/* Overall score card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-black/90 via-[#10121a] to-black border border-amber-500/25 flex items-center justify-between mb-5 shadow-lg">
          <div>
            <span className="text-xs text-zinc-400">Match Compatibility:</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-extrabold text-amber-300 font-cinematic">
                {match.totalScore}%
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                match.matchLevel === 'exact'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : match.matchLevel === 'strong'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  : match.matchLevel === 'possible'
                  ? 'bg-zinc-800 text-zinc-300 border border-white/10'
                  : 'bg-zinc-800 text-zinc-400'
              }`}>
                {match.matchLevel} Match
              </span>
            </div>
          </div>

          <div className="w-14 h-14 rounded-full border-4 border-amber-500/30 border-t-amber-400 flex items-center justify-center font-bold text-sm text-amber-300 shadow-md">
            {match.totalScore}
          </div>
        </div>

        {/* Criteria Breakdown */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {criteria.map((item, idx) => {
            const percent = Math.round((item.score / item.max) * 100);
            return (
              <div key={idx} className="p-2.5 rounded-lg bg-black/50 border border-amber-500/15 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-zinc-200">{item.name}</span>
                  <span className="text-[11px] font-mono text-amber-300 font-bold">
                    {item.score} / {item.max} pts
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percent >= 80 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : percent >= 50 ? 'bg-yellow-500' : 'bg-amber-700'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 truncate">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Explanations */}
        {((match.reasons || match.notes) && (match.reasons || match.notes).length > 0) && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-zinc-300 space-y-1">
            <span className="font-bold text-amber-300 block text-[11px]">Match Notes:</span>
            {(match.reasons || match.notes).map((r: string, i: number) => (
              <p key={i} className="text-[11px] text-zinc-300 flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span>{r}</span>
              </p>
            ))}
          </div>
        )}

        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};

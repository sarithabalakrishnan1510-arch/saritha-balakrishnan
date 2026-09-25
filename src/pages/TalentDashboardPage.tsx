import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Video, 
  Calendar, 
  Building2, 
  AlertCircle, 
  Edit3, 
  UserCheck, 
  FileText, 
  ChevronRight,
  ExternalLink,
  Save,
  User,
  LogIn
} from 'lucide-react';
import { useApp } from '../lib/store/appStore';
import { calculateRoleMatchScore } from '../lib/matching/engine';
import { ApplyModal } from '../components/casting/ApplyModal';
import { MatchBreakdownModal } from '../components/casting/MatchBreakdownModal';
import { CastingRole, Audition } from '../types';

export const TalentDashboardPage: React.FC = () => {
  const { 
    currentUser, 
    currentTalent, 
    applications, 
    auditions, 
    castingRoles, 
    castingCalls, 
    switchUserRole,
    withdrawApplication, 
    updateAuditionStatus, 
    updateTalentProfile, 
    calculateTalentProfileCompletion 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'matches' | 'applications' | 'auditions' | 'profile'>('matches');

  // Modals
  const [applyRole, setApplyRole] = useState<CastingRole | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [breakdownRole, setBreakdownRole] = useState<CastingRole | null>(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  // Self-tape submission state for audition
  const [activeAuditionSubmission, setActiveAuditionSubmission] = useState<string | null>(null);
  const [selfTapeInput, setSelfTapeInput] = useState('');
  const [auditionNotesInput, setAuditionNotesInput] = useState('');

  // Profile Edit State
  const [stageName, setStageName] = useState(currentTalent?.stage_name || '');
  const [bio, setBio] = useState(currentTalent?.bio || '');
  const [playingAgeMin, setPlayingAgeMin] = useState(currentTalent?.playing_age_min || 18);
  const [playingAgeMax, setPlayingAgeMax] = useState(currentTalent?.playing_age_max || 28);
  const [workingStatus, setWorkingStatus] = useState(currentTalent?.working_status || 'available');
  const [profileSaved, setProfileSaved] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <User className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-white font-cinematic">Talent Hub Authentication</h2>
        <p className="text-zinc-400 text-xs">
          Sign in to access your Malayalam cinema audition callbacks, self-tape submissions, and role match engine.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            onClick={() => switchUserRole('talent')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
          >
            <span>Log In as Devika Mohan (Artist)</span>
          </button>
          <Link to="/login" className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15 flex items-center justify-center gap-1.5 border border-amber-500/20">
            <LogIn className="w-3.5 h-3.5" />
            <span>Go to Login Desk</span>
          </Link>
        </div>
      </div>
    );
  }

  const talent = currentTalent;
  const completion = talent ? calculateTalentProfileCompletion(talent) : 0;

  // Filter My Applications
  const myApplications = applications.filter(a => a.talent_user_id === currentUser.id);

  // Filter My Auditions
  const myAuditions = auditions.filter(a => a.talent_user_id === currentUser.id);

  // Calculate Matches for this talent
  const scoredRoles: { role: CastingRole; call: any; score: number; match: any }[] = [];
  if (talent) {
    for (const role of castingRoles) {
      const call = castingCalls.find(c => c.id === role.casting_call_id);
      if (call && call.status === 'published') {
        const match = calculateRoleMatchScore(role, talent);
        if (match.totalScore > 0) {
          scoredRoles.push({ role, call, score: match.totalScore, match });
        }
      }
    }
    scoredRoles.sort((a, b) => b.score - a.score);
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateTalentProfile({
      stage_name: stageName,
      bio,
      playing_age_min: Number(playingAgeMin),
      playing_age_max: Number(playingAgeMax),
      working_status: workingStatus as any,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleAuditionSubmit = (auditionId: string) => {
    updateAuditionStatus(auditionId, 'submitted', selfTapeInput, auditionNotesInput);
    setActiveAuditionSubmission(null);
    setSelfTapeInput('');
    setAuditionNotesInput('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Welcome Header */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/30 via-[#0d0e14] to-black border border-amber-500/30 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <img
            src={
              currentUser.avatar_url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop'
            }
            alt={currentUser.full_name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-amber-500/30"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-cinematic">
                {talent?.stage_name || currentUser.full_name}
              </h1>
              {talent?.verification_status === 'verified' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Verified Actor
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              {talent?.primary_category || 'Artist'} • {talent?.city || 'Kochi'}, {talent?.district || 'Ernakulam'}
            </p>
            <span className="inline-block text-[11px] text-emerald-400 font-medium">
              Status: Available for audition calls
            </span>
          </div>
        </div>

        {/* Profile Completion Card */}
        <div className="p-4 rounded-xl bg-black/60 border border-amber-500/20 sm:w-64 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-300 font-medium">Profile Strength</span>
            <span className="font-bold text-amber-400">{completion}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                completion >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-400 to-yellow-500'
              }`}
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400">
            {completion < 100 ? 'Add showreels and more dialect credits to reach 100%' : 'Profile is 100% complete!'}
          </p>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-amber-500/20 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('matches')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'matches'
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow-md'
              : 'text-zinc-400 hover:text-amber-200 hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Smart Matches ({scoredRoles.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'applications'
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow-md'
              : 'text-zinc-400 hover:text-amber-200 hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Applications ({myApplications.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('auditions')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'auditions'
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow-md'
              : 'text-zinc-400 hover:text-amber-200 hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Auditions & Callbacks ({myAuditions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow-md'
              : 'text-zinc-400 hover:text-amber-200 hover:bg-white/5'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Casting Profile</span>
        </button>
      </div>

      {/* Tab 1: Smart Matches */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Roles matching your playing age, gender, dialect, and district</span>
            <span>Sorted by compatibility score</span>
          </div>

          <div className="space-y-4">
            {scoredRoles.map(({ role, call, score, match }) => (
              <div
                key={role.id}
                className="rounded-xl bg-[#0d0e14] border border-amber-500/20 p-5 hover:border-amber-400/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-lg"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-base">{role.role_name}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-zinc-300">
                      Age {role.playing_age_min}–{role.playing_age_max}
                    </span>
                    <span className="text-[11px] capitalize text-amber-300">
                      {role.gender_requirement}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      {role.compensation_text || 'Standard scale'}
                    </span>
                  </div>

                  <p className="text-zinc-400 text-xs line-clamp-1">{role.role_description}</p>

                  <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                    <span className="text-zinc-300 font-semibold">{call.company_name}</span>
                    <span>•</span>
                    <span>Project: {call.title}</span>
                    <span>•</span>
                    <span>Location: {role.shoot_location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Score badge */}
                  <button
                    onClick={() => {
                      setBreakdownRole(role);
                      setIsBreakdownOpen(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-transform hover:scale-105 ${
                      score >= 85
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : score >= 65
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{score}% Match</span>
                  </button>

                  <button
                    onClick={() => {
                      setApplyRole(role);
                      setIsApplyOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold text-xs transition-all shadow-md"
                  >
                    1-Click Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: My Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Tracking status of roles you have applied for</span>
            <span>Real-time updates directly from productions</span>
          </div>

          {myApplications.length === 0 ? (
            <div className="p-8 text-center bg-black/40 rounded-2xl border border-amber-500/10 space-y-3">
              <FileText className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-white">No active applications</p>
              <p className="text-xs text-zinc-400">Apply to matching roles from the Smart Matches tab.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myApplications.map(app => {
                const role = castingRoles.find(r => r.id === app.casting_role_id);
                const call = castingCalls.find(c => c.id === role?.casting_call_id);

                return (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl bg-[#0d0e14] border border-amber-500/20 space-y-3 text-xs shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-white">{role?.role_name || 'Role'}</h4>
                        <p className="text-zinc-400 text-xs">
                          {call?.company_name} • {call?.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          app.status === 'shortlisted'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : app.status === 'audition'
                            ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                            : app.status === 'selected'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : app.status === 'viewed'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}>
                          {app.status}
                        </span>

                        {app.status !== 'withdrawn' && (
                          <button
                            onClick={() => withdrawApplication(app.id)}
                            className="text-xs text-zinc-500 hover:text-red-400 underline"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>

                    {app.message && (
                      <p className="p-2.5 rounded bg-black/40 text-zinc-300 text-[11px] italic">
                        "{app.message}"
                      </p>
                    )}

                    {app.production_notes && (
                      <div className="p-2.5 rounded bg-amber-950/20 border border-amber-500/20 text-amber-200 text-[11px]">
                        <strong>Production Feedback:</strong> {app.production_notes}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-1 border-t border-white/5">
                      <span>Submitted: {new Date(app.submitted_at).toLocaleDateString()}</span>
                      {app.viewed_at && <span>Reviewed by Director</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Auditions & Callbacks */}
      {activeTab === 'auditions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Invitations, screen tests, and self-tape submissions</span>
          </div>

          {myAuditions.length === 0 ? (
            <div className="p-8 text-center bg-black/40 rounded-2xl border border-amber-500/10 space-y-3">
              <Video className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-white">No audition invitations yet</p>
              <p className="text-xs text-zinc-400">Productions review applications daily and send callback invites here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myAuditions.map(aud => {
                const role = castingRoles.find(r => r.id === aud.casting_role_id);

                return (
                  <div
                    key={aud.id}
                    className="p-5 rounded-2xl bg-[#0d0e14] border border-amber-500/20 space-y-4 text-xs shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                          {aud.audition_type.toUpperCase()} AUDITION
                        </span>
                        <h4 className="text-lg font-bold text-white">{role?.role_name}</h4>
                        <div className="flex items-center gap-3 text-zinc-400 text-xs mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            {aud.date} at {aud.time}
                          </span>
                          {aud.location && <span>• {aud.location}</span>}
                        </div>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        aud.status === 'accepted'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : aud.status === 'submitted'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {aud.status}
                      </span>
                    </div>

                    {aud.instructions && (
                      <div className="p-3 rounded-xl bg-black/50 border border-amber-500/10 space-y-1">
                        <strong className="text-zinc-200 block text-[11px]">Director's Audition Instructions:</strong>
                        <p className="text-zinc-300 text-xs">{aud.instructions}</p>
                      </div>
                    )}

                    {aud.script_file_url && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <a
                          href={aud.script_file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-amber-400 hover:text-amber-300 underline font-semibold"
                        >
                          Download Audition Scene Script (PDF)
                        </a>
                      </div>
                    )}

                    {/* Self-Tape Submission Area if self-tape type */}
                    {aud.talent_self_tape_url ? (
                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                        <span>Submitted Self-Tape: {aud.talent_self_tape_url}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                    ) : (
                      <div className="pt-2 flex items-center gap-2">
                        {activeAuditionSubmission === aud.id ? (
                          <div className="w-full space-y-2 p-3 rounded-xl bg-black/60 border border-amber-500/30">
                            <label className="text-[11px] font-semibold text-zinc-300 block">
                              Submit YouTube / Vimeo / Drive Audition Video URL
                            </label>
                            <input
                              type="url"
                              value={selfTapeInput}
                              onChange={e => setSelfTapeInput(e.target.value)}
                              placeholder="https://youtu.be/... or Google Drive URL"
                              className="w-full bg-zinc-900 border border-amber-500/25 rounded-lg px-3 py-1.5 text-xs text-white"
                            />
                            <textarea
                              rows={2}
                              value={auditionNotesInput}
                              onChange={e => setAuditionNotesInput(e.target.value)}
                              placeholder="Any notes regarding character interpretation..."
                              className="w-full bg-zinc-900 border border-amber-500/25 rounded-lg px-3 py-1.5 text-xs text-white"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setActiveAuditionSubmission(null)}
                                className="px-3 py-1 rounded text-zinc-400 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleAuditionSubmit(aud.id)}
                                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold shadow-md"
                              >
                                Submit Video
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            {aud.status === 'invited' && (
                              <button
                                onClick={() => updateAuditionStatus(aud.id, 'accepted')}
                                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                              >
                                Accept Callback
                              </button>
                            )}
                            <button
                              onClick={() => setActiveAuditionSubmission(aud.id)}
                              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Submit Audition Video / Tape</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Profile Quick Editor */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="max-w-2xl p-6 rounded-2xl bg-[#0d0e14] border border-amber-500/20 space-y-4 text-xs shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/15">
            <h3 className="text-base font-bold text-white font-cinematic text-amber-400">Quick Profile Editor</h3>
            {profileSaved && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Profile Updated!
              </span>
            )}
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">Stage Name / Screen Name</label>
            <input
              type="text"
              value={stageName}
              onChange={e => setStageName(e.target.value)}
              className="w-full bg-black/60 border border-amber-500/25 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Playing Age Min</label>
              <input
                type="number"
                value={playingAgeMin}
                onChange={e => setPlayingAgeMin(Number(e.target.value))}
                className="w-full bg-black/60 border border-amber-500/25 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Playing Age Max</label>
              <input
                type="number"
                value={playingAgeMax}
                onChange={e => setPlayingAgeMax(Number(e.target.value))}
                className="w-full bg-black/60 border border-amber-500/25 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">Working Availability</label>
            <select
              value={workingStatus}
              onChange={e => setWorkingStatus(e.target.value as any)}
              className="w-full bg-black/60 border border-amber-500/25 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="available">Available for Shoots & Auditions</option>
              <option value="busy">Currently on Active Shoot Schedule</option>
              <option value="partially_available">Available for Selected Dates</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">Actor Biography & Background</label>
            <textarea
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full bg-black/60 border border-amber-500/25 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-2 text-right">
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold text-xs shadow-md flex items-center gap-1.5 ml-auto"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* Apply Modal */}
      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        role={applyRole}
        castingCall={castingCalls.find(c => c.id === applyRole?.casting_call_id)}
      />

      {/* Match Breakdown Modal */}
      <MatchBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        role={breakdownRole}
        talent={talent}
      />
    </div>
  );
};

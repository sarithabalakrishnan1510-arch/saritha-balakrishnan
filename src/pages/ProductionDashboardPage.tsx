import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Building2, 
  Film, 
  PlusCircle, 
  Users, 
  Calendar, 
  Video, 
  Bookmark, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Filter, 
  FileText,
  LogIn
} from 'lucide-react';
import { useApp } from '../lib/store/appStore';
import { ApplicationsKanban } from '../components/production/ApplicationsKanban';
import { Project, CastingRole, TalentProfile, ProjectType } from '../types';

export const ProductionDashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const inviteTalentId = searchParams.get('inviteTalent');

  const { 
    currentUser, 
    currentProduction, 
    projects, 
    castingCalls, 
    castingRoles, 
    applications, 
    shortlists, 
    auditions, 
    talents, 
    switchUserRole,
    createProject, 
    createAudition 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'projects' | 'shortlists' | 'auditions'>('pipeline');
  
  // Audition Scheduling Modal
  const [isAuditionModalOpen, setIsAuditionModalOpen] = useState(Boolean(inviteTalentId));
  const [auditionTalentId, setAuditionTalentId] = useState<string>(inviteTalentId || 'user_talent_1');
  const [auditionRoleId, setAuditionRoleId] = useState<string>('role_1');
  const [auditionDate, setAuditionDate] = useState<string>('2026-10-05');
  const [auditionTime, setAuditionTime] = useState<string>('11:00 AM');
  const [auditionLocation, setAuditionLocation] = useState<string>('Anwar Rasheed Entertainments, Kaloor Studio, Kochi');
  const [auditionInstructions, setAuditionInstructions] = useState<string>('Please prepare Scene 12 dialogs.');

  // New Project Form
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState<ProjectType>('feature_film');
  const [newProjectDirector, setNewProjectDirector] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('Kochi & Idukki, Kerala');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Building2 className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-white font-cinematic">Production Portal Access</h2>
        <p className="text-zinc-400 text-xs">
          Sign in to manage active film projects, review applicant audition tapes, and schedule casting calls.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            onClick={() => switchUserRole('production')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold shadow hover:bg-amber-500 flex items-center justify-center gap-1.5"
          >
            <span>Log In as Anwar Rasheed (Studio)</span>
          </button>
          <Link to="/login" className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15 flex items-center justify-center gap-1.5">
            <LogIn className="w-3.5 h-3.5" />
            <span>Go to Login Desk</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleCreateNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    createProject({
      name: newProjectName,
      project_type: newProjectType,
      director_name: newProjectDirector || 'Director',
      primary_location: newProjectLocation,
      description: newProjectDescription,
      production_house: currentProduction?.company_name || 'Production House',
    });
    setIsNewProjectOpen(false);
    setNewProjectName('');
    setNewProjectDirector('');
    setNewProjectDescription('');
  };

  const handleOpenAuditionModal = (talentUserId: string, roleId: string) => {
    setAuditionTalentId(talentUserId);
    setAuditionRoleId(roleId);
    setIsAuditionModalOpen(true);
  };

  const handleScheduleAudition = (e: React.FormEvent) => {
    e.preventDefault();
    createAudition({
      talent_user_id: auditionTalentId,
      casting_role_id: auditionRoleId,
      date: auditionDate,
      time: auditionTime,
      location: auditionLocation,
      instructions: auditionInstructions,
      audition_type: 'in_person',
    });
    setIsAuditionModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Production Top Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/30 via-[#0d0e14] to-black border border-amber-500/30 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Verified Production Portal
            </span>
            <span className="text-xs text-zinc-400">Kerala Producers Association Registered</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-cinematic">
            {currentProduction?.company_name || 'Anwar Rasheed Entertainments'}
          </h1>
          <p className="text-xs text-zinc-400">
            {projects.length} Active Film Projects • {castingCalls.length} Casting Notices • {applications.length} Total Candidates in Pipeline
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/production/casting/new"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Casting Call</span>
          </Link>

          <button
            onClick={() => setIsNewProjectOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors border border-amber-500/30 hover:border-amber-400/50"
          >
            + New Film Project
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-amber-500/20 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'pipeline'
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow-md'
              : 'text-zinc-400 hover:text-amber-200 hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Audition Pipeline Kanban ({applications.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'projects'
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow-md'
              : 'text-zinc-400 hover:text-amber-200 hover:bg-white/5'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Active Film Projects ({projects.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('shortlists')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'shortlists'
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow-md'
              : 'text-zinc-400 hover:text-amber-200 hover:bg-white/5'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Talent Shortlists ({shortlists.length})</span>
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
          <span>Scheduled Screen Tests ({auditions.length})</span>
        </button>
      </div>

      {/* Tab 1: Pipeline Kanban */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <ApplicationsKanban
            applications={applications}
            onOpenAuditionModal={handleOpenAuditionModal}
          />
        </div>
      )}

      {/* Tab 2: Projects */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(proj => {
            const calls = castingCalls.filter(c => c.project_id === proj.id);

            return (
              <div
                key={proj.id}
                className="rounded-2xl bg-[#0d0e14] border border-amber-500/20 p-6 space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {proj.project_type}
                    </span>
                    <span className="text-[10px] text-zinc-400 capitalize">
                      {proj.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white font-cinematic">{proj.name}</h3>
                  <p className="text-xs text-amber-400 font-medium">Directed by {proj.director_name}</p>
                  <p className="text-xs text-zinc-400 line-clamp-2">{proj.description}</p>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Shoot Location:</span>
                    <span className="text-zinc-200">{proj.primary_location}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Casting Calls:</span>
                    <span className="text-amber-400 font-semibold">{calls.length} Active</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Shortlists */}
      {activeTab === 'shortlists' && (
        <div className="space-y-6">
          {shortlists.map(shortlist => (
            <div key={shortlist.id} className="rounded-2xl bg-[#0d0e14] border border-amber-500/20 p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-amber-500/15 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white font-cinematic">{shortlist.name}</h3>
                  <p className="text-xs text-zinc-400">{shortlist.description || 'Curated candidate pool'}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  {shortlist.talent_ids.length} Actors Shortlisted
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {shortlist.talent_ids.map(talentId => {
                  const tal = talents.find(t => t.user_id === talentId);
                  if (!tal) return null;

                  return (
                    <div
                      key={talentId}
                      className="p-3 rounded-xl bg-black/50 border border-amber-500/15 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={tal.user?.avatar_url}
                          alt={tal.user?.full_name}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-amber-500/20"
                        />
                        <div>
                          <h4 className="font-bold text-white">{tal.stage_name || tal.user?.full_name}</h4>
                          <span className="text-[10px] text-zinc-400">{tal.primary_category} • {tal.city || tal.user?.city || 'Kerala'}</span>
                        </div>
                      </div>
                      <Link
                        to={`/talent/${tal.id}`}
                        className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        Profile →
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Scheduled Auditions */}
      {activeTab === 'auditions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {auditions.map(aud => {
              const tal = talents.find(t => t.user_id === aud.talent_user_id);
              const role = castingRoles.find(r => r.id === aud.casting_role_id);

              return (
                <div key={aud.id} className="p-5 rounded-2xl bg-[#0d0e14] border border-amber-500/20 space-y-3 text-xs shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      {aud.audition_type.toUpperCase()} SCREEN TEST
                    </span>
                    <span className="text-xs font-bold text-emerald-400 capitalize">{aud.status}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={tal?.user?.avatar_url}
                      alt={tal?.user?.full_name}
                      className="w-12 h-12 rounded-full object-cover ring-1 ring-amber-500/20"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{tal?.stage_name || tal?.user?.full_name}</h4>
                      <p className="text-xs text-amber-400 font-medium">Role: {role?.role_name}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/60 border border-amber-500/10 space-y-1 text-[11px] text-zinc-300">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{aud.date} at {aud.time}</span>
                    </div>
                    <p className="text-zinc-400">{aud.location || 'Online Audition Link'}</p>
                    <p className="text-zinc-300 pt-1">Notes: {aud.instructions}</p>
                  </div>

                  {aud.talent_self_tape_url && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
                      <strong>Submitted Self Tape:</strong>{' '}
                      <a href={aud.talent_self_tape_url} target="_blank" rel="noreferrer" className="underline">
                        View Audition Reel ↗
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Audition Scheduling Modal */}
      {isAuditionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0d0e14] border border-amber-500/30 p-6 space-y-4 text-white shadow-2xl">
            <h3 className="text-lg font-bold font-cinematic text-amber-400">Schedule Audition / Screen Test</h3>
            <form onSubmit={handleScheduleAudition} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Select Character Role</label>
                <select
                  value={auditionRoleId}
                  onChange={e => setAuditionRoleId(e.target.value)}
                  className="w-full bg-black/60 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {castingRoles.map(r => (
                    <option key={r.id} value={r.id}>{r.role_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={auditionDate}
                    onChange={e => setAuditionDate(e.target.value)}
                    className="w-full bg-black/60 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Call Time</label>
                  <input
                    type="text"
                    value={auditionTime}
                    onChange={e => setAuditionTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="w-full bg-black/60 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Audition Venue / Online Link</label>
                <input
                  type="text"
                  value={auditionLocation}
                  onChange={e => setAuditionLocation(e.target.value)}
                  placeholder="Studio address or Google Meet URL"
                  className="w-full bg-black/60 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Instructions to Actor</label>
                <textarea
                  rows={3}
                  value={auditionInstructions}
                  onChange={e => setAuditionInstructions(e.target.value)}
                  placeholder="Scenes to prepare, costume reference, dialect instructions..."
                  className="w-full bg-black/60 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAuditionModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold shadow-md"
                >
                  Dispatch Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {isNewProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0d0e14] border border-amber-500/30 p-6 space-y-4 text-white shadow-2xl">
            <h3 className="text-lg font-bold font-cinematic text-amber-400">Add New Project / Production</h3>
            <form onSubmit={handleCreateNewProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Project Title *</label>
                <input
                  required
                  type="text"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  placeholder="e.g. Manjummel Boys 2 / Lucifer Chapter 2"
                  className="w-full bg-black/60 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Project Type</label>
                  <select
                    value={newProjectType}
                    onChange={e => setNewProjectType(e.target.value as ProjectType)}
                    className="w-full bg-black/60 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="feature_film">Feature Film</option>
                    <option value="web_series">Web / OTT Series</option>
                    <option value="short_film">Short Film</option>
                    <option value="ad_film">Ad Film / TVC</option>
                    <option value="music_video">Music Video</option>
                    <option value="documentary">Documentary</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Director Name</label>
                  <input
                    type="text"
                    value={newProjectDirector}
                    onChange={e => setNewProjectDirector(e.target.value)}
                    placeholder="e.g. Lijo Jose Pellissery"
                    className="w-full bg-black/60 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Primary Shoot Locations</label>
                <input
                  type="text"
                  value={newProjectLocation}
                  onChange={e => setNewProjectLocation(e.target.value)}
                  placeholder="e.g. Fort Kochi, Vagamon, Munnar"
                  className="w-full bg-black/60 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Brief Description / Logline</label>
                <textarea
                  rows={3}
                  value={newProjectDescription}
                  onChange={e => setNewProjectDescription(e.target.value)}
                  placeholder="Synopsis or story pitch for casting associates..."
                  className="w-full bg-black/60 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectOpen(false)}
                  className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold shadow-md"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

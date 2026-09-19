import React, { useState } from 'react';
import { 
  Users, 
  Video, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  ChevronRight, 
  Sparkles,
  Eye,
  ExternalLink,
  Filter,
  FileText
} from 'lucide-react';
import { Application, ApplicationStatus, CastingRole, TalentProfile } from '../../types';
import { useApp } from '../../lib/store/appStore';

interface ApplicationsKanbanProps {
  applications: Application[];
  onOpenAuditionModal?: (talentUserId: string, roleId: string) => void;
}

const STAGES: { id: ApplicationStatus; title: string; color: string; countColor: string }[] = [
  { id: 'applied', title: 'Applied', color: 'border-blue-500/40 text-blue-400', countColor: 'bg-blue-500/20 text-blue-300' },
  { id: 'viewed', title: 'Reviewed', color: 'border-purple-500/40 text-purple-400', countColor: 'bg-purple-500/20 text-purple-300' },
  { id: 'shortlisted', title: 'Shortlisted', color: 'border-amber-500/40 text-amber-400', countColor: 'bg-amber-500/20 text-amber-300' },
  { id: 'audition', title: 'Audition', color: 'border-rose-500/40 text-rose-400', countColor: 'bg-rose-500/20 text-rose-300' },
  { id: 'selected', title: 'Selected', color: 'border-emerald-500/40 text-emerald-400', countColor: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'rejected', title: 'Archived', color: 'border-zinc-600 text-zinc-400', countColor: 'bg-zinc-800 text-zinc-400' },
];

export const ApplicationsKanban: React.FC<ApplicationsKanbanProps> = ({
  applications,
  onOpenAuditionModal,
}) => {
  const { talents, castingRoles, updateApplicationStatus } = useApp();
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [activeNotesAppId, setActiveNotesAppId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState<string>('');

  // Filter by role if selected
  const filteredApps = selectedRoleFilter === 'all'
    ? applications
    : applications.filter(a => a.casting_role_id === selectedRoleFilter);

  // Group applications by role for filter dropdown
  const uniqueRoleIds = Array.from(new Set(applications.map(a => a.casting_role_id)));
  const relevantRoles = castingRoles.filter(r => uniqueRoleIds.includes(r.id));

  const handleSaveNotes = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (app) {
      updateApplicationStatus(appId, app.status, notesText);
      setActiveNotesAppId(null);
      setNotesText('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-black/40 border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-rose-400" />
          <span className="font-semibold text-white">Filter Pipeline by Role:</span>
          <select
            value={selectedRoleFilter}
            onChange={e => setSelectedRoleFilter(e.target.value)}
            className="rounded-lg bg-zinc-900 border border-white/15 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Roles ({applications.length} Candidates)</option>
            {relevantRoles.map(r => (
              <option key={r.id} value={r.id}>
                {r.role_name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-zinc-400">
          Showing {filteredApps.length} active candidates
        </span>
      </div>

      {/* Kanban Board Horizontal Scroll Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const stageApps = filteredApps.filter(a => a.status === stage.id);

          return (
            <div
              key={stage.id}
              className="flex flex-col rounded-xl bg-[#111319] border border-white/10 p-3 min-w-[240px] max-h-[750px]"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${stage.id === 'selected' ? 'bg-emerald-400' : stage.id === 'audition' ? 'bg-rose-400' : 'bg-zinc-400'}`} />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {stage.title}
                  </span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stage.countColor}`}>
                  {stageApps.length}
                </span>
              </div>

              {/* Candidates Column List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {stageApps.length === 0 ? (
                  <div className="p-4 text-center text-zinc-600 text-[11px] border border-dashed border-white/5 rounded-lg">
                    No candidates
                  </div>
                ) : (
                  stageApps.map(app => {
                    const talent = talents.find(t => t.user_id === app.talent_user_id);
                    const role = castingRoles.find(r => r.id === app.casting_role_id);

                    return (
                      <div
                        key={app.id}
                        className="rounded-lg bg-black/60 border border-white/10 p-3 hover:border-rose-500/40 transition-all space-y-2 text-xs shadow"
                      >
                        {/* Candidate Basic Info */}
                        <div className="flex items-start gap-2.5">
                          <img
                            src={
                              talent?.user?.avatar_url ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop'
                            }
                            alt={talent?.user?.full_name}
                            className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-white truncate">
                              {talent?.stage_name || talent?.user?.full_name}
                            </h4>
                            <span className="text-[10px] text-rose-300 block truncate font-medium">
                              Role: {role?.role_name}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {(talent?.city || talent?.user?.city || 'Kerala')}, {(talent?.district || talent?.user?.district || '')}
                            </span>
                          </div>
                        </div>

                        {/* Candidate message */}
                        {app.message && (
                          <p className="text-[11px] text-zinc-300 bg-white/5 p-2 rounded line-clamp-2 italic">
                            "{app.message}"
                          </p>
                        )}

                        {/* Self Tape link if provided */}
                        {app.self_tape_url && (
                          <a
                            href={app.self_tape_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Watch Self-Tape</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {/* Production internal notes display */}
                        {app.production_notes && (
                          <div className="text-[10px] bg-amber-950/30 border border-amber-500/20 text-amber-200 p-1.5 rounded">
                            <span className="font-semibold">Internal Note:</span> {app.production_notes}
                          </div>
                        )}

                        {/* Move Stage Quick Actions */}
                        <div className="pt-2 border-t border-white/5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-zinc-500">Move to:</span>
                            <select
                              value={app.status}
                              onChange={e => updateApplicationStatus(app.id, e.target.value as ApplicationStatus)}
                              className="bg-zinc-800 text-white rounded text-[10px] px-1.5 py-1 border border-white/10"
                            >
                              <option value="applied">Applied</option>
                              <option value="viewed">Reviewed</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="audition">Audition</option>
                              <option value="selected">Selected</option>
                              <option value="rejected">Archived</option>
                            </select>
                          </div>

                          <div className="flex items-center justify-between gap-1 pt-1">
                            <button
                              onClick={() => {
                                setActiveNotesAppId(activeNotesAppId === app.id ? null : app.id);
                                setNotesText(app.production_notes || '');
                              }}
                              className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              <span>{app.production_notes ? 'Edit Note' : '+ Note'}</span>
                            </button>

                            {onOpenAuditionModal && (
                              <button
                                onClick={() => onOpenAuditionModal(app.talent_user_id, app.casting_role_id)}
                                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-semibold"
                              >
                                Invite Audition
                              </button>
                            )}
                          </div>

                          {/* Inline Notes Editor */}
                          {activeNotesAppId === app.id && (
                            <div className="mt-2 p-2 rounded bg-zinc-900 border border-white/15 space-y-1.5">
                              <textarea
                                rows={2}
                                value={notesText}
                                onChange={e => setNotesText(e.target.value)}
                                placeholder="Director's comments / character notes..."
                                className="w-full bg-black/60 border border-white/10 rounded p-1.5 text-[11px] text-white"
                              />
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => setActiveNotesAppId(null)}
                                  className="text-[10px] text-zinc-400 hover:text-white px-2 py-0.5"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveNotes(app.id)}
                                  className="text-[10px] bg-emerald-600 text-white font-medium rounded px-2 py-0.5"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

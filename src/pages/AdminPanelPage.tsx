import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Building2, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Eye,
  Filter,
  UserX,
  Lock
} from 'lucide-react';
import { useApp } from '../lib/store/appStore';
import { TalentProfile, ProductionProfile, ReportStatus } from '../types';

export const AdminPanelPage: React.FC = () => {
  const { 
    currentUser, 
    reports, 
    talents, 
    productions, 
    castingCalls, 
    switchUserRole,
    updateReportStatus, 
    verifyTalent, 
    verifyProduction 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'reports' | 'verifications' | 'castings'>('reports');
  const [filterReportStatus, setFilterReportStatus] = useState<string>('all');

  if (currentUser?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-white font-cinematic">Film Chamber Admin Desk</h2>
        <p className="text-zinc-400 text-xs">
          Regulatory authority is required to access the Kerala Film Chamber & FEFKA safety and verification console.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            onClick={() => switchUserRole('admin')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold shadow hover:bg-purple-500 flex items-center justify-center gap-1.5"
          >
            <span>Log In as Film Chamber Admin</span>
          </button>
          <Link to="/login" className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15">
            Login Page
          </Link>
        </div>
      </div>
    );
  }

  // Filtered reports
  const filteredReports = reports.filter(r => {
    if (filterReportStatus !== 'all' && r.status !== filterReportStatus) return false;
    return true;
  });

  const pendingTalents = talents.filter((t: TalentProfile) => t.verification_status === 'pending');
  const pendingProductions = productions.filter((p: ProductionProfile) => p.verification_status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="rounded-2xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-black border border-rose-500/30 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
              Super Admin Moderation Console
            </span>
            <span className="text-xs text-zinc-400">Cast Kerala Trust & Safety Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-cinematic">
            Industry Verification & Scam Shield
          </h1>
          <p className="text-xs text-zinc-400">
            Enforcing Malayalam Cinema zero-fee casting directives, minor protections, and producer registry verifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-center min-w-[90px]">
            <span className="text-lg font-bold text-rose-400 block">{reports.filter(r => r.status === 'open' || (r.status as string) === 'pending').length}</span>
            <span className="text-[10px] text-zinc-400">Pending Alerts</span>
          </div>
          <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-center min-w-[90px]">
            <span className="text-lg font-bold text-emerald-400 block">{pendingTalents.length + pendingProductions.length}</span>
            <span className="text-[10px] text-zinc-400">Verifications</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-rose-600 text-white shadow'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Reported Suspicious Activity ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'verifications'
              ? 'bg-rose-600 text-white shadow'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Producer & Talent Verifications ({pendingTalents.length + pendingProductions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('castings')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'castings'
              ? 'bg-rose-600 text-white shadow'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>All Published Casting Calls ({castingCalls.length})</span>
        </button>
      </div>

      {/* Tab 1: Reports & Safety Alerts */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>User reports alleging audition fees, fake directors, or safety violations</span>
            <select
              value={filterReportStatus}
              onChange={e => setFilterReportStatus(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="action_taken">Action Taken</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredReports.map(report => (
              <div
                key={report.id}
                className="p-5 rounded-2xl bg-[#13151f] border border-white/10 space-y-4 text-xs shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {(report.reason || report.reason_category || 'Scam Alert').replace('_', ' ')}
                    </span>
                    <span className="text-zinc-400 text-xs">Target: <strong>{report.target_type}</strong> (ID: {report.target_id})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      report.status === 'open' || (report.status as string) === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : report.status === 'resolved' || (report.status as string) === 'action_taken'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {report.status}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1">
                  <span className="text-zinc-400 text-[11px] block">Reporter Allegation:</span>
                  <p className="text-zinc-200 text-xs">{report.description}</p>
                </div>

                {/* Admin Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                  <span className="text-[11px] text-zinc-500">Moderate Case:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateReportStatus(report.id, 'investigating')}
                      className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                    >
                      Investigate
                    </button>
                    <button
                      onClick={() => updateReportStatus(report.id, 'action_taken')}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Take Action & Warn</span>
                    </button>
                    <button
                      onClick={() => updateReportStatus(report.id, 'dismissed')}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 text-xs"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Verifications Queue */}
      {activeTab === 'verifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Talents pending verification */}
          <div className="p-6 rounded-2xl bg-[#13151f] border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white font-cinematic flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-400" />
              <span>Talent Profile Approvals</span>
            </h3>

            {talents.map((talent: TalentProfile) => (
              <div
                key={talent.id}
                className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={talent.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop'}
                    alt={talent.user?.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-white">{talent.stage_name || talent.user?.full_name}</h4>
                    <p className="text-[10px] text-zinc-400">{talent.primary_category} • {talent.city || talent.user?.city || 'Kerala'}</p>
                    <span className={`text-[10px] font-bold ${
                      talent.verification_status === 'verified' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {talent.verification_status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => verifyTalent(talent.id)}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px]"
                  >
                    Verify
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Productions pending verification */}
          <div className="p-6 rounded-2xl bg-[#13151f] border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white font-cinematic flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Production Houses & Banners</span>
            </h3>

            {productions.map((prod: ProductionProfile) => (
              <div
                key={prod.id}
                className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-white">{prod.company_name}</h4>
                  <p className="text-[10px] text-zinc-400">Head: {prod.user?.full_name || prod.company_name} • {prod.company_address_private || prod.user?.city || 'Kochi'}</p>
                  <span className={`text-[10px] font-bold ${
                    prod.verification_status === 'verified' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {prod.verification_status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => verifyProduction(prod.id)}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px]"
                  >
                    Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: All Castings */}
      {activeTab === 'castings' && (
        <div className="space-y-3">
          {castingCalls.map(call => (
            <div
              key={call.id}
              className="p-4 rounded-xl bg-[#13151f] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{call.title}</h4>
                  {call.has_safety_flag && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30">
                      FLAGGED FOR AUDIT
                    </span>
                  )}
                </div>
                <p className="text-zinc-400 text-xs mt-0.5">{call.company_name} • Deadline: {call.application_deadline}</p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/casting/${call.id}`}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                >
                  View Listing
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

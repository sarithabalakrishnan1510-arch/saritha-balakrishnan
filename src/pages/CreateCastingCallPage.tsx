import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../lib/store/appStore';
import { CastingRole, Project } from '../types';
import { checkCastingSafety } from '../lib/matching/engine';
import { KERALA_DISTRICTS } from '../lib/constants';

export const CreateCastingCallPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, createCastingCall, currentUser, currentProduction } = useApp();

  const [projectId, setProjectId] = useState<string>(projects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );

  const [roles, setRoles] = useState<Partial<CastingRole>[]>([
    {
      role_name: 'Lead Protagonist',
      role_description: 'Intense dramatic role with strong emotional screen presence.',
      gender_requirement: 'any',
      playing_age_min: 22,
      playing_age_max: 32,
      experience_requirement: 'experienced',
      shoot_location: 'Kochi, Kerala',
      language_requirement: ['Malayalam (Native)'],
      paid_status: 'paid',
      compensation_text: 'Industry standard package',
      showreel_required: false,
      self_tape_required: true,
      number_needed: 1,
    },
  ]);

  const [submitted, setSubmitted] = useState(false);

  // Live Safety Scan
  const combinedText = `${title} ${description} ${roles.map(r => r.role_description + ' ' + r.compensation_text).join(' ')}`;
  const safetyCheck = checkCastingSafety(combinedText);

  const handleAddRole = () => {
    setRoles(prev => [
      ...prev,
      {
        role_name: 'Supporting Character',
        role_description: '',
        gender_requirement: 'any',
        playing_age_min: 25,
        playing_age_max: 40,
        experience_requirement: 'any',
        shoot_location: 'Kerala',
        language_requirement: ['Malayalam (Fluent)'],
        paid_status: 'paid',
        compensation_text: 'Daily scale',
        showreel_required: false,
        self_tape_required: false,
        number_needed: 1,
      },
    ]);
  };

  const handleRemoveRole = (index: number) => {
    if (roles.length <= 1) return;
    setRoles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRoleChange = (index: number, field: keyof CastingRole, value: any) => {
    setRoles(prev =>
      prev.map((role, i) => (i === index ? { ...role, [field]: value } : role))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || roles.length === 0) return;

    createCastingCall(
      {
        project_id: projectId,
        title,
        description,
        application_deadline: deadline,
      },
      roles
    );

    setSubmitted(true);
    setTimeout(() => {
      navigate('/casting');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="border-b border-white/10 pb-4">
        <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-1">
          Production Desk
        </span>
        <h1 className="text-3xl font-extrabold text-white font-cinematic tracking-tight">
          Publish New Casting Call
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Define character roles, age boundaries, dialects, and broadcast directly to verified Kerala talents.
        </p>
      </div>

      {/* Safety Compliance Alert */}
      {safetyCheck.isFlagged ? (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-amber-100 block">Safety Guard Triggered:</strong>
            <p>Our automated compliance scanner detected potentially flagged phrasing:</p>
            <ul className="list-disc list-inside text-[11px] text-amber-300">
              {safetyCheck.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <p className="text-[11px] text-amber-400/80 pt-1">
              Note: Solicitations for audition fees or portfolio charges are strictly prohibited and will result in post suspension.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Safety Audit Passed: Listing complies with Kerala Film Chamber Fair Casting Guidelines.</span>
        </div>
      )}

      {submitted ? (
        <div className="p-12 text-center rounded-2xl bg-[#141620] border border-white/10 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-xl font-bold text-white font-cinematic">Casting Call Published!</h2>
          <p className="text-xs text-zinc-400">Broadcasting to matching talents across Kerala... Redirecting...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Call Info */}
          <div className="p-6 rounded-2xl bg-[#12141c] border border-white/10 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white font-cinematic">General Details</h3>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Select Film / OTT Project *</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
              >
                {projects.map((p: Project) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.production_house})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Casting Call Headline *</label>
              <input
                required
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Seeking Fresh Female & Male Leads for Upcoming Thriller"
                className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Project Synopsis & Shoot Overview *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Provide details on project mood, storyline, director's vision, and target filming dates..."
                className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Application Deadline *</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full sm:w-64 bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Roles Definition Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-cinematic">Character Roles</h3>
                <p className="text-xs text-zinc-400">Define each role for the matching engine</p>
              </div>
              <button
                type="button"
                onClick={handleAddRole}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1 border border-white/15"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Role</span>
              </button>
            </div>

            <div className="space-y-4">
              {roles.map((role, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#141620] border border-white/10 space-y-4 text-xs relative"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <span className="font-bold text-rose-400 text-xs">Role #{idx + 1}</span>
                    {roles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(idx)}
                        className="text-zinc-500 hover:text-red-400 p-1"
                        title="Remove Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-zinc-300 mb-1">Character Name / Designation *</label>
                      <input
                        required
                        type="text"
                        value={role.role_name}
                        onChange={e => handleRoleChange(idx, 'role_name', e.target.value)}
                        placeholder="e.g. Sub-Inspector Vinod"
                        className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-300 mb-1">Gender Requirement</label>
                      <select
                        value={role.gender_requirement}
                        onChange={e => handleRoleChange(idx, 'gender_requirement', e.target.value)}
                        className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                      >
                        <option value="any">Any Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non_binary">Non-Binary</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold text-zinc-300 mb-1">Playing Age Min</label>
                      <input
                        type="number"
                        value={role.playing_age_min}
                        onChange={e => handleRoleChange(idx, 'playing_age_min', Number(e.target.value))}
                        className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-300 mb-1">Playing Age Max</label>
                      <input
                        type="number"
                        value={role.playing_age_max}
                        onChange={e => handleRoleChange(idx, 'playing_age_max', Number(e.target.value))}
                        className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-300 mb-1">Compensation</label>
                      <select
                        value={role.paid_status}
                        onChange={e => handleRoleChange(idx, 'paid_status', e.target.value)}
                        className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                      >
                        <option value="paid">Paid Scale</option>
                        <option value="deferred">Deferred / Profit Share</option>
                        <option value="unpaid">Volunteer / Student</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-300 mb-1">Shoot District/Location</label>
                      <input
                        type="text"
                        value={role.shoot_location}
                        onChange={e => handleRoleChange(idx, 'shoot_location', e.target.value)}
                        placeholder="e.g. Ernakulam"
                        className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1">Character Description & Psychological Profile</label>
                    <textarea
                      rows={2}
                      value={role.role_description}
                      onChange={e => handleRoleChange(idx, 'role_description', e.target.value)}
                      placeholder="Describe the character demeanor, physical build, and key traits..."
                      className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={role.self_tape_required}
                        onChange={e => handleRoleChange(idx, 'self_tape_required', e.target.checked)}
                        className="rounded border-white/20 bg-zinc-800 text-rose-600"
                      />
                      <span className="text-zinc-300">Self-Tape / Audition Clip Requested</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={role.showreel_required}
                        onChange={e => handleRoleChange(idx, 'showreel_required', e.target.checked)}
                        className="rounded border-white/20 bg-zinc-800 text-rose-600"
                      />
                      <span className="text-zinc-300">Prior Showreel Required</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg transition-all"
            >
              Publish Casting Notice
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Video, FileText, Sparkles, Send } from 'lucide-react';
import { CastingRole, CastingCall } from '../../types';
import { useApp } from '../../lib/store/appStore';
import { calculateRoleMatchScore } from '../../lib/matching/engine';
import confetti from 'canvas-confetti';

interface ApplyModalProps {
  role: CastingRole | null;
  castingCall?: CastingCall;
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ role, castingCall, isOpen, onClose }) => {
  const { currentUser, currentTalent, applyForRole, applications } = useApp();

  const [message, setMessage] = useState('');
  const [selfTapeUrl, setSelfTapeUrl] = useState('');
  const [actingClipUrl, setActingClipUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !role) return null;

  // Check existing application
  const existingApp = applications.find(
    a => a.casting_role_id === role.id && a.talent_user_id === currentUser?.id && a.status !== 'withdrawn'
  );

  // Match score preview
  const matchResult = currentTalent ? calculateRoleMatchScore(role, currentTalent) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentUser) {
      setErrorMessage('You must be logged in to apply.');
      return;
    }

    if (currentUser.role !== 'talent') {
      setErrorMessage('Please switch to a Talent persona to submit an actor application.');
      return;
    }

    if (!message.trim()) {
      setErrorMessage('Please include a brief note introducing yourself to the director/casting team.');
      return;
    }

    const res = applyForRole(role.id, message, selfTapeUrl);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to submit application.');
      return;
    }

    // Success fireworks
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (_) {}

    setSubmitted(true);
  };

  const handleModalClose = () => {
    setSubmitted(false);
    setMessage('');
    setSelfTapeUrl('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#14161d] border border-white/15 p-6 shadow-2xl relative text-white">
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-cinematic text-white">Application Submitted!</h3>
            <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
              Your profile, media, and cover note have been securely transmitted to the production team for <strong>{role.role_name}</strong>.
            </p>
            <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-xs text-zinc-400 text-left">
              <div className="flex items-center gap-2 text-zinc-300 font-semibold mb-1">
                <span>Next Steps:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>Production will review your application status in their pipeline.</li>
                <li>You will receive real-time notifications if shortlisted or invited for auditions.</li>
                <li>You can track status anytime under your Talent Dashboard.</li>
              </ul>
            </div>
            <button
              onClick={handleModalClose}
              className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                Direct Application
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">{role.role_name}</h2>
              <p className="text-xs text-zinc-400 mt-1">
                {castingCall?.company_name || 'Production'} • {castingCall?.title || 'Casting Call'}
              </p>
            </div>

            {/* Smart Match pill if available */}
            {matchResult && (
              <div className="mb-4 p-3 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-400">Match Compatibility:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white">{matchResult.totalScore}% {matchResult.matchLevel.toUpperCase()}</span>
                  </div>
                </div>
                <div className="text-[11px] text-zinc-400 text-right">
                  <span>Age: {role.playing_age_min}–{role.playing_age_max}</span>
                  <br />
                  <span className="capitalize">Gender: {role.gender_requirement}</span>
                </div>
              </div>
            )}

            {existingApp ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2 mb-4">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Already Applied</span>
                </div>
                <p>
                  You already submitted an application on {new Date(existingApp.submitted_at).toLocaleDateString()}.
                  Current status: <strong className="uppercase">{existingApp.status}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Cover Note to Director / Casting Director *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Briefly state your relevant screen/theatre experience, fluency in required dialect, and enthusiasm for this role..."
                    className="w-full rounded-lg bg-black/50 border border-white/15 px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>Self-Tape / Audition Video URL (Optional)</span>
                    <span className="text-[10px] text-zinc-500">Unlisted YouTube / Vimeo / Drive</span>
                  </label>
                  <div className="relative">
                    <Video className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                    <input
                      type="url"
                      value={selfTapeUrl}
                      onChange={e => setSelfTapeUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=... or Google Drive link"
                      className="w-full rounded-lg bg-black/50 border border-white/15 pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-black/30 border border-white/10 text-[11px] text-zinc-400 space-y-1">
                  <p className="font-semibold text-zinc-300">Privacy Safeguards:</p>
                  <p>Your private phone number and home address remain concealed. Initial casting callbacks will be routed through Cast Kerala messages or registered guardian contacts.</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Application</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { ContentReport } from '../../types';
import { useApp } from '../../lib/store/appStore';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'casting_call' | 'talent_profile' | 'vendor' | 'other';
  targetId: string;
  targetTitle: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const { submitReport } = useApp();

  const [reason, setReason] = useState<string>('payment_scam');
  const [description, setDescription] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport({
      target_type: targetType as any,
      target_id: targetId,
      target_title: targetTitle,
      reason: reason as any,
      description,
    });
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#14161f] border border-white/15 p-6 shadow-2xl relative text-white">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white font-cinematic">Report Submitted</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Your confidential report has been flagged for investigation by the Kerala Film Chamber moderation desk. The listing will be temporarily suspended if safety rules are breached.
            </p>
            <button
              onClick={handleClose}
              className="mt-2 w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-bold text-white font-cinematic">Flag / Report Content</h2>
            </div>

            <p className="text-xs text-zinc-400">
              Reporting: <strong className="text-white">{targetTitle}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Primary Reason for Report *
              </label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="payment_scam">Unlawful Fee / Deposit / Audition Charge</option>
                <option value="fake_identity">Impersonation / Fake Production House</option>
                <option value="child_safety_violation">Child Artist Safety / Minor Violation</option>
                <option value="harassment">Harassment / Inappropriate Communication</option>
                <option value="misleading">Misleading Shoot Details / False Compensation</option>
                <option value="other">Other Violation of Terms</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Details & Evidence (WhatsApp messages, screenshots, demand notes) *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what occurred, any phone numbers contacted, or requests for advance money..."
                className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 text-[11px] text-rose-300">
              <strong>Cast Kerala Zero-Tolerance Policy:</strong> Genuine film productions NEVER request audition fees, script registration charges, or casting portfolio money.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Moderation</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

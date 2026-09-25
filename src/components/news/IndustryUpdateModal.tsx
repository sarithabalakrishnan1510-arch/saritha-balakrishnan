import React, { useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  Award, 
  Clock, 
  Tag, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { IndustryUpdate } from '../../types';
import { ShareButton } from '../common/ShareButton';
import { useToast } from '../../lib/store/toastStore';

interface IndustryUpdateModalProps {
  update: IndustryUpdate | null;
  isOpen: boolean;
  onClose: () => void;
}

export const IndustryUpdateModal: React.FC<IndustryUpdateModalProps> = ({
  update,
  isOpen,
  onClose
}) => {
  const { showCopiedToast } = useToast();
  const [copiedRef, setCopiedRef] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !update) return null;

  const handleCopyReference = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(update.official_reference_no);
    setCopiedRef(true);
    showCopiedToast(update.official_reference_no, `Circular reference ${update.official_reference_no} copied.`);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'press_release':
        return { label: 'Official Press Release', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
      case 'guild_directive':
        return { label: 'Guild Directive (FEFKA/AMMA)', bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' };
      case 'government_subsidy':
        return { label: 'Government Order / KSFDC', bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
      case 'trade_boxoffice':
        return { label: 'Trade & Box Office Wire', bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' };
      case 'festival_awards':
        return { label: 'Chalachitra Academy / IFFK', bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30' };
      default:
        return { label: 'Industry Dispatch', bg: 'bg-white/10 text-zinc-300 border-white/20' };
    }
  };

  const categoryStyle = getCategoryBadge(update.category);

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl rounded-2xl bg-[#0d0e14] border border-amber-500/30 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Banner image if present */}
        {update.image_url && (
          <div className="h-48 w-full relative overflow-hidden bg-zinc-950 border-b border-amber-500/20">
            <img 
              src={update.image_url} 
              alt={update.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e14] via-[#0d0e14]/50 to-transparent" />
            
            {/* Top actions */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <ShareButton
                title={update.title}
                url={`/?update=${update.id}`}
                description={`Malayalam Cinema Industry Update: ${update.title} (${update.official_reference_no})`}
                type="generic"
                variant="icon"
                size="md"
                className="bg-black/70 backdrop-blur-md border border-amber-500/30 text-amber-300"
              />
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-black/70 hover:bg-black/90 text-zinc-300 hover:text-white border border-amber-500/30 backdrop-blur-md transition-colors"
                aria-label="Close communiqué"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header metadata row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${categoryStyle.bg}`}>
                {categoryStyle.label}
              </span>
              {update.urgent && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  Statutory Notice
                </span>
              )}
              {update.verified && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Communiqué
                </span>
              )}
            </div>

            {/* Reference & Copy Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyReference}
                className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-white/10 border border-amber-500/20 text-[11px] font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                title="Copy reference number"
              >
                {copiedRef ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied Ref</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-amber-400" />
                    <span>REF: {update.official_reference_no}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Title & Source */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white font-cinematic leading-snug">
              {update.title}
            </h2>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{update.source_organization}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>Published {update.published_relative}</span>
              </div>
            </div>
          </div>

          {/* Key Takeaways Callout */}
          {update.key_takeaways && update.key_takeaways.length > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 to-black/40 border border-amber-500/30 space-y-2 shadow-sm">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                Official Takeaways & Directives
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-200">
                {update.key_takeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full Communiqué Text */}
          <div className="space-y-3 text-sm text-zinc-300 leading-relaxed font-sans">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300/80">
              Official Text & Communiqué
            </h4>
            {update.full_content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Signatory Box if provided */}
          {update.signatory && (
            <div className="p-4 rounded-xl bg-black/60 border border-amber-500/20 flex items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                  Authorised Signatory
                </span>
                <span className="font-bold text-white text-sm mt-0.5 block">
                  {update.signatory.name}
                </span>
                <span className="text-zinc-400 text-xs">
                  {update.signatory.designation}
                </span>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 text-[11px] font-semibold border border-amber-500/30">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Guild Certified Seal
                </span>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-amber-500/15">
            <Tag className="w-3.5 h-3.5 text-amber-400/70" />
            {update.tags.map(tag => (
              <span 
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded bg-black/40 text-amber-200/80 border border-amber-500/20 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Modal Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-amber-500/20">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ShareButton
                title={update.title}
                url={`/?update=${update.id}`}
                description={`Malayalam Cinema Industry Update: ${update.title}`}
                type="generic"
                variant="card-action"
                label="Share Dispatch"
                className="px-3 py-2 text-xs"
              />
              {update.official_url && (
                <a
                  href={update.official_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-lg bg-black/40 hover:bg-amber-500/10 border border-amber-500/20 text-zinc-300 hover:text-amber-200 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Portal Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold text-xs transition-all text-center shadow-md active:scale-95"
            >
              Close Dispatch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

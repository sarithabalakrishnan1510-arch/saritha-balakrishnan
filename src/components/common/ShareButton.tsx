import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { useToast } from '../../lib/store/toastStore';

export interface ShareButtonProps {
  title: string;
  url: string; // relative or absolute URL
  description?: string;
  type?: 'casting' | 'location' | 'generic';
  variant?: 'icon' | 'card-action' | 'badge' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
  showCopiedState?: boolean;
  onShareSuccess?: () => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  url,
  description,
  type = 'generic',
  variant = 'icon',
  size = 'md',
  className = '',
  label,
  showCopiedState = true,
  onShareSuccess
}) => {
  const { showCopiedToast } = useToast();
  const [copied, setCopied] = useState(false);

  // Construct absolute URL
  const getShareUrl = () => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${window.location.origin}${cleanPath}`;
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = getShareUrl();
    const shareText = description || `Check out ${title} on Cast Kerala`;

    // 1. Copy to clipboard
    let copiedSuccessfully = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        copiedSuccessfully = true;
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copiedSuccessfully = document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.warn('Clipboard write error', err);
    }

    // 2. Trigger native share if on mobile devices that support it, but only non-blockingly
    if (navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl
        });
      } catch (shareErr) {
        // User cancelled or share dismissed, clipboard copy is still preserved!
      }
    }

    // 3. Trigger Copied Notification Toast
    const typeLabel = type === 'casting' ? 'Casting call' : type === 'location' ? 'Location listing' : 'Link';
    showCopiedToast(
      title,
      `${typeLabel} link copied to clipboard: ${shareUrl.replace(/^https?:\/\//, '')}`
    );

    // 4. In-button visual state
    if (showCopiedState) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }

    if (onShareSuccess) {
      onShareSuccess();
    }
  };

  const sizeClasses = {
    sm: 'p-1 text-xs',
    md: 'p-1.5 text-xs',
    lg: 'px-3 py-2 text-sm'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4 h-4'
  };

  const buttonTitle = copied 
    ? 'Link copied to clipboard!' 
    : `Share ${type === 'casting' ? 'casting call' : type === 'location' ? 'location' : 'item'}`;

  // Variant 1: Compact Icon (ideal for card overlays and toolbars)
  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleShare}
        className={`rounded-lg border transition-all flex items-center justify-center ${
          copied
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border-white/10'
        } ${sizeClasses[size]} ${className}`}
        title={buttonTitle}
        aria-label={buttonTitle}
      >
        {copied ? (
          <Check className={`${iconSizes[size]} text-emerald-400`} />
        ) : (
          <Share2 className={iconSizes[size]} />
        )}
      </button>
    );
  }

  // Variant 2: Card Action / Pill with Text
  if (variant === 'card-action') {
    return (
      <button
        type="button"
        onClick={handleShare}
        className={`rounded-lg border font-medium text-xs transition-all flex items-center gap-1.5 ${
          copied
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border-white/10'
        } ${className || 'px-2.5 py-1.5'}`}
        title={buttonTitle}
        aria-label={buttonTitle}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
            <span>{label || 'Share'}</span>
          </>
        )}
      </button>
    );
  }

  // Variant 3: Standard Button with Label
  return (
    <button
      type="button"
      onClick={handleShare}
      className={`rounded-xl border font-semibold transition-all flex items-center justify-center gap-1.5 ${
        copied
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-md shadow-emerald-950/20'
          : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border-white/10'
      } ${sizeClasses[size]} ${className}`}
      title={buttonTitle}
      aria-label={buttonTitle}
    >
      {copied ? (
        <>
          <Check className={`${iconSizes[size]} text-emerald-400`} />
          <span className="text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <Share2 className={iconSizes[size]} />
          <span>{label || (type === 'casting' ? 'Share Call' : type === 'location' ? 'Share Venue' : 'Share')}</span>
        </>
      )}
    </button>
  );
};

import React, { useState, useRef } from 'react';
import {
  Download, RefreshCw, Maximize2, Video, Image as ImageIcon,
  X, Play, AlertCircle, Wand2, Share2, Copy, Check,
} from 'lucide-react';
import type { ChatMessage } from '@/hooks/useChat';

interface OutputCardProps {
  message: ChatMessage;
  onRetry?: () => void;
  onUseForVideo?: (url: string) => void;
}

const MagicStar = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C12.4 6.5 13.8 10.2 17.5 12C13.8 13.8 12.4 17.5 12 22C11.6 17.5 10.2 13.8 6.5 12C10.2 10.2 11.6 6.5 12 2Z" />
  </svg>
);

const INTENT_ICONS: Record<string, React.ReactNode> = {
  video:      <Video className="w-6 h-6 text-violet-400" />,
  image:      <ImageIcon className="w-6 h-6 text-cyan-400" />,
  motion:     <Video className="w-6 h-6 text-emerald-400" />,
  ugc:        <Video className="w-6 h-6 text-amber-400" />,
  influencer: <ImageIcon className="w-6 h-6 text-pink-400" />,
};

/* ─── Generating card ──────────────────────────────────────────── */
export function GeneratingCard({ message }: { message: ChatMessage }) {
  const progress = message.progress ?? 0;
  const intent = message.intent ?? 'video';

  const statusText =
    progress < 20 ? 'Initializing...' :
    progress < 40 ? 'Processing request...' :
    progress < 65 ? 'AI is creating...' :
    progress < 90 ? 'Finalizing...' :
    'Almost done...';

  const titleMap: Record<string, string> = {
    video: 'Generating Video',
    image: 'Generating Image',
    motion: 'Applying Motion',
    ugc: 'Creating UGC Ad',
    influencer: 'Crafting Influencer',
  };

  return (
    <div className="agent-glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 relative z-10">
        <div className="star-icon star-icon-md flex-shrink-0">
          <MagicStar className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">
            {titleMap[intent] ?? 'Creating...'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{message.prompt}</p>
        </div>
        <span className="text-xs font-mono text-primary font-semibold tabular-nums">{progress}%</span>
      </div>

      {/* Animated preview area */}
      <div className="mx-4 mb-3 rounded-xl overflow-hidden aspect-video bg-muted/40 relative z-10"
        style={{ backdropFilter: 'blur(8px)' }}>
        <div className="absolute inset-0 grid-dot-bg opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="chat-gen-spinner">
              {INTENT_ICONS[intent] ?? <Video className="w-6 h-6 text-primary/70" />}
            </div>
            <span className="text-xs text-muted-foreground font-medium tracking-wide">{statusText}</span>
          </div>
        </div>
        <div className="absolute inset-0 chat-shimmer-overlay pointer-events-none" />
      </div>

      {/* Progress bar */}
      <div className="mx-4 mb-4 relative z-10">
        <div className="gen-progress-bar-track">
          <div
            className="gen-progress-bar-fill"
            style={{ width: `${progress}%`, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Video output card ────────────────────────────────────────── */
export function VideoOutputCard({ message, onRetry }: OutputCardProps) {
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDownload = async () => {
    if (!message.outputUrl) return;
    const a = document.createElement('a');
    a.href = message.outputUrl;
    a.download = `lovix-video-${Date.now()}.mp4`;
    a.click();
  };

  const handleCopyLink = async () => {
    if (!message.outputUrl) return;
    await navigator.clipboard.writeText(message.outputUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="chat-output-card chat-output-card-complete">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center flex-shrink-0">
          <Video className="w-4 h-4 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Video Ready</p>
          {message.settings && (
            <p className="text-[11px] text-muted-foreground">
              {String(message.settings.aspectRatio ?? '16:9')} · {String(message.settings.seconds ?? 5)}s · {String(message.settings.quality ?? 'HD').toUpperCase()}
            </p>
          )}
        </div>
        <span className="badge-neon text-[10px] py-0.5 px-2">Done</span>
      </div>

      {/* Video preview */}
      {message.outputUrl && (
        <div className="mx-4 mb-3 rounded-xl overflow-hidden bg-black relative group">
          <video
            ref={videoRef}
            src={message.outputUrl}
            controls
            loop
            className="w-full max-h-72 object-contain"
            preload="metadata"
          />
          <button
            onClick={() => window.open(message.outputUrl, '_blank')}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            title="Open in new tab"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4 flex-wrap">
        <button onClick={handleDownload} className="chat-action-btn chat-action-btn-primary flex-1">
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
        <button onClick={handleCopyLink} className="chat-action-btn flex-1">
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button onClick={onRetry} className="chat-action-btn">
          <RefreshCw className="w-3.5 h-3.5" />
          Redo
        </button>
      </div>
    </div>
  );
}

/* ─── Image output card ────────────────────────────────────────── */
export function ImageOutputCard({ message, onRetry, onUseForVideo }: OutputCardProps) {
  const [lightbox, setLightbox] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    if (!message.outputUrl) return;
    const a = document.createElement('a');
    a.href = message.outputUrl;
    a.download = `lovix-image-${Date.now()}.png`;
    a.click();
  };

  const handleCopy = async () => {
    if (!message.outputUrl) return;
    await navigator.clipboard.writeText(message.outputUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="chat-output-card chat-output-card-complete">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pb-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Image Ready</p>
            {message.settings?.style && (
              <p className="text-[11px] text-muted-foreground capitalize">{String(message.settings.style)} · HD</p>
            )}
          </div>
          <span className="badge-neon text-[10px] py-0.5 px-2">Done</span>
        </div>

        {/* Image preview */}
        {message.outputUrl && (
          <div
            className="mx-4 mb-3 rounded-xl overflow-hidden bg-muted cursor-zoom-in relative group"
            onClick={() => setLightbox(true)}
          >
            <img
              src={message.outputUrl}
              alt="Generated"
              className="w-full max-h-80 object-contain"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 px-4 pb-4 flex-wrap">
          <button onClick={handleDownload} className="chat-action-btn chat-action-btn-primary flex-1">
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
          {onUseForVideo && message.outputUrl && (
            <button onClick={() => onUseForVideo(message.outputUrl!)} className="chat-action-btn flex-1">
              <Video className="w-3.5 h-3.5" />
              Use for Video
            </button>
          )}
          <button onClick={handleCopy} className="chat-action-btn">
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onRetry} className="chat-action-btn">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && message.outputUrl && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <button className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors" onClick={() => setLightbox(false)}>
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={message.outputUrl}
            alt="Full size"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

/* ─── Error card ───────────────────────────────────────────────── */
export function ErrorCard({ message, onRetry }: OutputCardProps) {
  return (
    <div className="chat-output-card border border-destructive/30 bg-destructive/5">
      <div className="flex items-start gap-3 p-4">
        <div className="w-8 h-8 rounded-xl bg-destructive/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground mb-1">Generation Failed</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{message.error}</p>
        </div>
      </div>
      {onRetry && (
        <div className="px-4 pb-4">
          <button onClick={onRetry} className="chat-action-btn chat-action-btn-primary w-full">
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Coming soon card ─────────────────────────────────────────── */
export function ComingSoonCard({ intent }: { intent: string }) {
  return (
    <div className="chat-output-card">
      <div className="flex items-center gap-3 p-4">
        <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
          <Wand2 className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground capitalize">{intent} in Chat</p>
          <p className="text-xs text-muted-foreground mt-0.5">Use the sidebar tool for full {intent} controls.</p>
        </div>
      </div>
    </div>
  );
}

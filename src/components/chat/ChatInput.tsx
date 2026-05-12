import { useState, useRef, useCallback, useEffect } from 'react';
import {
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileArchive,
  Lightbulb,
  MessageSquareText,
  Monitor,
  Play,
  Plus,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  UserPlus,
  UserRound,
  Volume2,
  WandSparkles,
  X,
} from 'lucide-react';
import influencerSelfie from '@/assets/ai-influencer-selfie.jpg';
import influencerPink from '@/assets/ai-influencer-pink.jpg';

const MagicStar = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C12.4 6.5 13.8 10.2 17.5 12C13.8 13.8 12.4 17.5 12 22C11.6 17.5 10.2 13.8 6.5 12C10.2 10.2 11.6 6.5 12 2Z" />
  </svg>
);

interface ChatInputProps {
  onSend: (text: string, file?: File | null) => void;
  disabled?: boolean;
}

type ComposerMode = 'chat' | 'generate';
type DurationOption = 'Auto' | '15sec' | '30sec' | '1min' | '2min' | '3min';
type FormatOption = 'Auto' | 'Verticale' | 'Orizzontale';

const avatars = [
  { id: 'auto', name: 'Automatico', subtitle: 'Avatar', image: null },
  { id: 'business', name: 'Confident Business', subtitle: 'Avatar', image: influencerSelfie },
  { id: 'pink', name: 'Creator Pink', subtitle: 'Avatar', image: influencerPink },
];

const durationOptions: DurationOption[] = ['Auto', '15sec', '30sec', '1min', '2min', '3min'];
const formatOptions: FormatOption[] = ['Auto', 'Verticale', 'Orizzontale'];

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [mode, setMode] = useState<ComposerMode>('generate');
  const [duration, setDuration] = useState<DurationOption>('Auto');
  const [format, setFormat] = useState<FormatOption>('Auto');
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [openMenu, setOpenMenu] = useState<'add' | 'mode' | 'duration' | 'format' | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 150) + 'px';
  }, []);

  useEffect(() => { adjustHeight(); }, [value, adjustHeight]);

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => setFilePreview(e.target?.result as string);
    reader.readAsDataURL(f);
    setOpenMenu(null);
  };

  const buildPrompt = () => {
    const trimmed = value.trim();
    const details: string[] = ['Tipo progetto: video marketing Lovix', 'Output finale: video generato con agente creativo'];
    if (mode === 'generate') details.push('Modalita: genera piano video');
    if (mode === 'chat') details.push('Modalita: pianifica e prepara il video');
    if (duration !== 'Auto') details.push(`Durata: ${duration}`);
    if (format !== 'Auto') details.push(`Formato: ${format}`);
    if (selectedAvatar.id !== 'auto') details.push(`Avatar: ${selectedAvatar.name}`);
    if (file) details.push(`Asset allegato: ${file.type.startsWith('video/') ? 'video reference' : 'image reference'}`);
    return details.length ? `${trimmed}\n\n${details.join(' | ')}` : trimmed;
  };

  const handleSend = async () => {
    if ((!value.trim() && !file) || disabled || isSending) return;
    const text = buildPrompt();
    setValue('');
    setFile(null);
    setFilePreview(null);
    setIsSending(true);
    setOpenMenu(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    try {
      await onSend(text, file);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = (value.trim().length > 0 || !!file) && !disabled && !isSending;

  return (
    <div className="chat-input-wrapper">
      <div className={`chat-composer ${isSending ? 'opacity-75' : ''}`}>
        <div className="chat-composer-top">
          <button type="button" className="chat-context-chip chat-context-chip-wide" onClick={() => setShowAvatarModal(true)}>
            <span className="chat-context-avatar">
              {selectedAvatar.image ? <img src={selectedAvatar.image} alt="" /> : <UserRound className="h-5 w-5" />}
            </span>
            <span className="min-w-0 text-left">
              <span className="chat-context-title">{selectedAvatar.name}</span>
              <span className="chat-context-subtitle">{selectedAvatar.subtitle}</span>
            </span>
          </button>

          <button type="button" className="chat-context-chip">
            <span className="chat-context-icon chat-context-icon-accent"><Play className="h-4 w-4 fill-current" /></span>
            <span className="min-w-0 text-left">
              <span className="chat-context-title">Founder&apos;s Insight</span>
              <span className="chat-context-subtitle">Voice</span>
            </span>
          </button>

          <button type="button" className="chat-context-chip">
            <span className="chat-context-icon"><FileArchive className="h-4 w-4" /></span>
            <span className="min-w-0 text-left">
              <span className="chat-context-title">Automatico</span>
              <span className="chat-context-subtitle">Stile/Brand</span>
            </span>
          </button>
        </div>

        {filePreview && file && (
          <div className="chat-attachment-preview">
            <div className="relative">
              <img src={filePreview} alt="Attached" className="h-12 w-12 rounded-2xl object-cover ring-1 ring-border" />
              <button
                onClick={() => { setFile(null); setFilePreview(null); }}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <span className="truncate text-xs font-medium text-muted-foreground">{file.name}</span>
          </div>
        )}

        <div className="chat-composer-main">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Descrivi la tua idea video ..."
            rows={2}
            disabled={disabled || isSending}
            className="chat-composer-textarea"
            style={{ maxHeight: 150 }}
          />
          <div className="chat-scroll-hint" aria-hidden="true">
            <ChevronDown className="h-3.5 w-3.5 rotate-180" />
            <ChevronDown className="-mt-1 h-3.5 w-3.5" />
          </div>
        </div>

        <div className="chat-composer-actions">
          <div className="chat-action-group">
            <div className="relative">
              <button
                type="button"
                className={`chat-round-tool ${openMenu === 'add' ? 'chat-round-tool-active' : ''}`}
                onClick={() => setOpenMenu(openMenu === 'add' ? null : 'add')}
                aria-label="Aggiungi risorse"
              >
                {openMenu === 'add' ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </button>
              {openMenu === 'add' && (
                <div className="chat-popover chat-add-popover">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="chat-popover-row">
                    <FileArchive className="h-4 w-4" />
                    <span>Risorse</span>
                  </button>
                  <button type="button" className="chat-popover-row">
                    <Lightbulb className="h-4 w-4" />
                    <span>Conoscenza</span>
                  </button>
                </div>
              )}
            </div>

            <button type="button" className="chat-icon-tool" aria-label="Idea">
              <Lightbulb className="h-5 w-5" />
            </button>
            <button type="button" className="chat-icon-tool" aria-label="Impostazioni">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>

          <div className="chat-action-group chat-action-group-right">
            <span className="chat-model-pill">
              <strong>Seedance</strong>
              <span>Disattivato</span>
            </span>

            <div className="relative">
              <button
                type="button"
                className="chat-mode-pill"
                onClick={() => setOpenMenu(openMenu === 'mode' ? null : 'mode')}
              >
                <WandSparkles className="h-4 w-4" />
                <span>{mode === 'generate' ? 'Genera' : 'Piano'}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {openMenu === 'mode' && (
                <div className="chat-popover chat-mode-popover">
                  <button type="button" onClick={() => { setMode('chat'); setOpenMenu(null); }} className="chat-popover-choice">
                    <MessageSquareText className="h-5 w-5" />
                    <span>
                      <strong>Piano</strong>
                      <small>Prepara storyboard, scene e prompt finale</small>
                    </span>
                  </button>
                  <button type="button" onClick={() => { setMode('generate'); setOpenMenu(null); }} className="chat-popover-choice">
                    <WandSparkles className="h-5 w-5" />
                    <span>
                      <strong>Genera</strong>
                      <small>Crea il piano e prepara la generazione video</small>
                    </span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`chat-send-btn ${canSend ? 'chat-send-btn-active' : ''} ${isSending ? 'chat-send-btn-sending' : ''}`}
              type="button"
              aria-label="Invia"
            >
              {isSending
                ? <div className="star-icon" style={{ width: 16, height: 16, animation: 'star-spin 0.8s linear infinite' }}><MagicStar className="h-4 w-4" /></div>
                : <ArrowUp className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="chat-composer-settings">
          <div className="relative">
            <button type="button" className="chat-setting-pill" onClick={() => setOpenMenu(openMenu === 'duration' ? null : 'duration')}>
              <Clock3 className="h-4 w-4" />
              <span>{duration === 'Auto' ? 'Automatico' : duration}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {openMenu === 'duration' && (
              <div className="chat-popover chat-select-popover">
                {durationOptions.map(option => (
                  <button type="button" key={option} className="chat-select-row" onClick={() => { setDuration(option); setOpenMenu(null); }}>
                    <Clock3 className="h-4 w-4" />
                    <span>{option === 'Auto' ? 'Automatico' : option}</span>
                    {duration === option && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
                    {(option === '2min' || option === '3min') && <Sparkles className="ml-auto h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button type="button" className="chat-setting-pill" onClick={() => setOpenMenu(openMenu === 'format' ? null : 'format')}>
              {format === 'Verticale' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
              <span>{format === 'Auto' ? 'Automatico' : format}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {openMenu === 'format' && (
              <div className="chat-popover chat-select-popover">
                {formatOptions.map(option => (
                  <button type="button" key={option} className="chat-select-row" onClick={() => { setFormat(option); setOpenMenu(null); }}>
                    {option === 'Verticale' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                    <span>{option === 'Auto' ? 'Automatico' : option}</span>
                    {format === option && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button type="button" className="chat-setting-pill chat-setting-pill-icon" aria-label="Nascondi riferimenti">
            <Volume2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showAvatarModal && (
        <div className="chat-avatar-overlay" role="dialog" aria-modal="true">
          <div className="chat-avatar-modal">
            <div className="chat-avatar-modal-head">
              <h3>Scegli un avatar</h3>
              <div className="flex items-center gap-2">
                <button type="button" className="chat-create-avatar-btn">
                  <UserPlus className="h-4 w-4" />
                  <span>Crea avatar</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button type="button" className="chat-modal-close" onClick={() => setShowAvatarModal(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="chat-avatar-tabs">
              <span>Usati di recente</span>
              <span className="chat-avatar-tab-active">I miei avatar</span>
              <span>Avatar pubblici</span>
            </div>

            <div className="chat-avatar-grid">
              {avatars.filter(a => a.image).map(avatar => (
                <button
                  key={avatar.id}
                  type="button"
                  className={`chat-avatar-card ${selectedAvatar.id === avatar.id ? 'chat-avatar-card-active' : ''}`}
                  onClick={() => { setSelectedAvatar(avatar); setShowAvatarModal(false); }}
                >
                  <img src={avatar.image!} alt={avatar.name} />
                  <span>{avatar.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}

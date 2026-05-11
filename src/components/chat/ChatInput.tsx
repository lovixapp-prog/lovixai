import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

const MagicStar = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C12.4 6.5 13.8 10.2 17.5 12C13.8 13.8 12.4 17.5 12 22C11.6 17.5 10.2 13.8 6.5 12C10.2 10.2 11.6 6.5 12 2Z" />
  </svg>
);

interface ChatInputProps {
  onSend: (text: string, file?: File | null) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  }, []);

  useEffect(() => { adjustHeight(); }, [value, adjustHeight]);

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => setFilePreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleSend = async () => {
    if ((!value.trim() && !file) || disabled || isSending) return;
    const text = value.trim();
    setValue('');
    setFile(null);
    setFilePreview(null);
    setIsSending(true);
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
      <div className={`chat-input-box ${isSending ? 'opacity-70' : ''}`}>

        {/* File preview */}
        {filePreview && file && (
          <div className="px-3 pt-3 flex gap-2 items-center">
            <div className="relative inline-block">
              <img src={filePreview} alt="Attached" className="h-10 w-10 rounded-lg object-cover ring-1 ring-border" />
              <button
                onClick={() => { setFile(null); setFilePreview(null); }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-[160px]">{file.name}</span>
          </div>
        )}

        <div className="flex items-end gap-2 p-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors mb-0.5"
            title="Attach image"
            type="button"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask LOVIX AI to create anything..."
            rows={1}
            disabled={disabled || isSending}
            className="flex-1 bg-transparent border-0 outline-none resize-none text-foreground text-sm leading-relaxed placeholder:text-muted-foreground/45 py-1"
            style={{ maxHeight: 180 }}
          />

          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`flex-shrink-0 chat-send-btn ${canSend ? 'chat-send-btn-active' : ''} ${isSending ? 'chat-send-btn-sending' : ''}`}
            type="button"
            aria-label="Send"
          >
            {isSending
              ? <div className="star-icon" style={{ width: 16, height: 16, animation: 'star-spin 0.8s linear infinite' }}><MagicStar className="w-4 h-4" /></div>
              : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <p className="text-center text-[10px] text-muted-foreground/30 mt-1.5">
        Enter to send · Shift+Enter for new line
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
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

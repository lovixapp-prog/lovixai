import { useState, useRef, useCallback } from 'react';
import { Upload, Check, X, ChevronRight, Sparkles, Zap } from 'lucide-react';
import type { ChatMessage } from '@/hooks/useChat';
import type { AgentField } from '@/lib/aiRouter';

const INTENT_META: Record<string, { title: string; emoji: string; color: string; creditHint: string }> = {
  motion:     { title: 'Apply Motion',       emoji: '🎬', color: 'text-violet-400',  creditHint: '~5 credits' },
  ugc:        { title: 'UGC Ad Creator',     emoji: '📱', color: 'text-cyan-400',    creditHint: '~20 credits' },
  influencer: { title: 'AI Influencer',      emoji: '✨', color: 'text-pink-400',    creditHint: '~15 credits' },
};

/* ─── Field: File Upload ────────────────────────────────────────── */
function FieldUpload({
  field, value, onChange,
}: { field: AgentField; value: File | null; onChange: (f: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onChange(f);
  }, [onChange]);

  return (
    <div>
      <p className="agent-field-label">{field.label}{field.required && <span className="text-primary/80 ml-0.5">*</span>}</p>
      {field.subtitle && <p className="agent-field-subtitle">{field.subtitle}</p>}
      <div
        className={`agent-upload-zone mt-2 ${isDragging ? 'agent-upload-zone-drag' : ''} ${value ? 'agent-upload-zone-filled' : ''}`}
        onClick={() => !value && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && !value && inputRef.current?.click()}
      >
        {value ? (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{value.name}</p>
              <p className="text-xs text-muted-foreground">{(value.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onChange(null); }}
              className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              type="button"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-5">
            <div className="agent-upload-icon">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Drop file or <span className="text-primary font-semibold">browse</span>
            </p>
            <p className="text-[11px] text-muted-foreground/50 text-center">
              {field.accept?.replace(/,/g, ' · ') || 'Any file'}
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={field.accept}
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; onChange(f ?? null); e.target.value = ''; }}
        />
      </div>
    </div>
  );
}

/* ─── Field: Select pills ───────────────────────────────────────── */
function FieldSelect({
  field, value, onChange,
}: { field: AgentField; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="agent-field-label">{field.label}{field.required && <span className="text-primary/80 ml-0.5">*</span>}</p>
      {field.subtitle && <p className="agent-field-subtitle">{field.subtitle}</p>}
      <div className="flex flex-wrap gap-2 mt-2">
        {field.options?.map(opt => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(active ? '' : opt.value)}
              className={`agent-option-pill ${active ? 'agent-option-pill-active' : ''}`}
            >
              {opt.emoji && <span className="mr-1 text-sm">{opt.emoji}</span>}
              <span>{opt.label}</span>
              {active && <Check className="w-3 h-3 ml-1.5 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Field: Text input ─────────────────────────────────────────── */
function FieldText({
  field, value, onChange,
}: { field: AgentField; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="agent-field-label">{field.label}{field.required && <span className="text-primary/80 ml-0.5">*</span>}</p>
      {field.subtitle && <p className="agent-field-subtitle">{field.subtitle}</p>}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="agent-glass-input mt-2"
      />
    </div>
  );
}

/* ─── Main Agent Request Card ───────────────────────────────────── */
interface AgentRequestCardProps {
  message: ChatMessage;
  onConfirm: (
    msgId: string,
    intent: string,
    prompt: string,
    settings: Record<string, unknown>,
    fields: AgentField[],
    collectedData: Record<string, string | File>,
  ) => void;
  onCancel: (msgId: string, fields: AgentField[], intent: string) => void;
}

export function AgentRequestCard({ message, onConfirm, onCancel }: AgentRequestCardProps) {
  const req = message.agentRequest!;
  const meta = INTENT_META[req.intent] ?? { title: req.intent, emoji: '✨', color: 'text-primary', creditHint: '' };

  // Track field values: string | File
  const [values, setValues] = useState<Record<string, string | File>>({});

  const setValue = (id: string, val: string | File | null) => {
    setValues(prev => {
      if (val === null || val === '') {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: val };
    });
  };

  // Validate: all required fields filled
  const isValid = req.fields
    .filter(f => f.required)
    .every(f => {
      const v = values[f.id];
      return v !== undefined && v !== '';
    });

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(
      message.id,
      req.intent,
      message.prompt ?? '',
      message.settings ?? {},
      req.fields,
      values,
    );
  };

  /* ── Confirmed state ── */
  if (req.status === 'confirmed') {
    return (
      <div className="agent-glass-card agent-glass-card-done px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{meta.emoji} {meta.title} — details confirmed</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {req.fields
                .filter(f => values[f.id])
                .map(f => {
                  const v = values[f.id];
                  return v instanceof File ? v.name : String(v).substring(0, 28);
                })
                .join(' · ')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Cancelled state ── */
  if (req.status === 'cancelled') {
    return (
      <div className="agent-glass-card px-4 py-3 opacity-50">
        <div className="flex items-center gap-2.5">
          <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-muted-foreground">Cancelled — ask me something else.</p>
        </div>
      </div>
    );
  }

  /* ── Pending state (main card) ── */
  return (
    <div className="agent-glass-card">
      {/* Header */}
      <div className="agent-glass-header">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-2xl bg-primary/12 border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_hsl(var(--primary)/0.15)]">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">LOVIX AI AGENT</span>
              <span className="text-[10px] font-semibold bg-primary/12 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                {meta.emoji} {meta.title}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground mt-1 leading-snug">{req.intro}</p>
          </div>
        </div>

        {/* Credit hint */}
        {meta.creditHint && (
          <div className="flex items-center gap-1.5 mt-3 px-1">
            <Zap className="w-3 h-3 text-amber-400/80 flex-shrink-0" />
            <span className="text-[11px] text-muted-foreground/60">{meta.creditHint} will be used on generate</span>
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="agent-glass-body space-y-5">
        {req.fields.map(field => {
          const val = values[field.id];
          if (field.type === 'file_upload') {
            return (
              <FieldUpload
                key={field.id}
                field={field}
                value={(val instanceof File ? val : null)}
                onChange={f => setValue(field.id, f)}
              />
            );
          }
          if (field.type === 'select') {
            return (
              <FieldSelect
                key={field.id}
                field={field}
                value={typeof val === 'string' ? val : ''}
                onChange={v => setValue(field.id, v)}
              />
            );
          }
          if (field.type === 'text' || field.type === 'textarea') {
            return (
              <FieldText
                key={field.id}
                field={field}
                value={typeof val === 'string' ? val : ''}
                onChange={v => setValue(field.id, v)}
              />
            );
          }
          return null;
        })}
      </div>

      {/* Footer CTAs */}
      <div className="agent-glass-footer">
        <button
          type="button"
          onClick={() => onCancel(message.id, req.fields, req.intent)}
          className="agent-cancel-btn"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!isValid}
          className="agent-confirm-btn"
        >
          <span>Generate</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

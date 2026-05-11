import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, PenLine, X } from 'lucide-react';
import type { ChatMessage } from '@/hooks/useChat';
import type { MarketingPlan } from '@/lib/aiRouter';
import AnimatedIconify from '@/components/ui/animated-iconify';

interface AgentPlanCardProps {
  message: ChatMessage;
  onConfirm: (
    msgId: string,
    intent: string,
    prompt: string,
    settings: Record<string, unknown>,
    plan: MarketingPlan,
  ) => void;
  onCancel: (msgId: string, intent: string, plan: MarketingPlan) => void;
}

const intentIcon: Record<string, string> = {
  video: 'solar:videocamera-record-bold-duotone',
  ugc: 'solar:shop-bold-duotone',
  image: 'solar:gallery-wide-bold-duotone',
  motion: 'solar:magic-stick-3-bold-duotone',
};

function splitLines(value: string): string[] {
  return value.split('\n').map(line => line.trim()).filter(Boolean);
}

export function AgentPlanCard({ message, onConfirm, onCancel }: AgentPlanCardProps) {
  const req = message.agentPlan!;
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [plan, setPlan] = useState<MarketingPlan>(req.plan);

  const shotText = useMemo(
    () => plan.shotList.map(step => `${step.title}: ${step.detail}`).join('\n'),
    [plan.shotList],
  );
  const [scriptDraft, setScriptDraft] = useState(plan.scriptOutline.join('\n'));
  const [shotDraft, setShotDraft] = useState(shotText);
  const [promptDraft, setPromptDraft] = useState(plan.finalPrompt);
  const [ugcBrief, setUgcBrief] = useState(plan.ugcBrief);

  const setUgcValue = <K extends keyof NonNullable<MarketingPlan['ugcBrief']>>(
    key: K,
    value: NonNullable<MarketingPlan['ugcBrief']>[K],
  ) => {
    setUgcBrief(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const applyEdits = () => {
    setPlan(prev => ({
      ...prev,
      format: ugcBrief?.aspectRatio ? `${ugcBrief.aspectRatio} ${ugcBrief.platform} format` : prev.format,
      duration: ugcBrief?.durationSeconds ? `${ugcBrief.durationSeconds}s UGC ad` : prev.duration,
      scriptOutline: splitLines(scriptDraft),
      shotList: splitLines(shotDraft).map(line => {
        const [title, ...rest] = line.split(':');
        return {
          title: title?.trim() || 'Scene',
          detail: rest.join(':').trim() || line,
        };
      }),
      finalPrompt: promptDraft.trim() || prev.finalPrompt,
      ugcBrief,
    }));
    setEditing(false);
    setExpanded(true);
  };

  if (req.status === 'accepted') {
    return (
      <div className="agent-glass-card agent-glass-card-done px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/25 bg-primary/15 text-primary">
            <AnimatedIconify icon="solar:check-circle-bold-duotone" className="h-4 w-4" pulse />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Piano approvato</p>
            <p className="text-xs text-muted-foreground">LOVIX Agent procede con il workflow scelto.</p>
          </div>
        </div>
      </div>
    );
  }

  if (req.status === 'cancelled') {
    return (
      <div className="agent-glass-card px-4 py-3 opacity-60">
        <div className="flex items-center gap-2.5">
          <X className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Piano annullato. Puoi chiedermi una nuova strategia.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-glass-card overflow-hidden">
      <div className="agent-glass-header">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15 text-primary shadow-[0_0_24px_hsl(var(--primary)/0.16)]">
            <AnimatedIconify icon={intentIcon[req.intent] ?? 'solar:stars-bold-duotone'} className="h-5 w-5" pulse />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">LOVIX Marketing Agent</span>
              <span className="rounded-full border border-primary/20 bg-primary/12 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Action plan
              </span>
            </div>
            <h3 className="mt-1 font-display text-lg font-bold text-foreground">{plan.title}</h3>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{req.intro || plan.summary}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ['Deliverable', plan.deliverable],
            ['Format', plan.format],
            ['Duration', plan.duration],
            ['Credits', plan.estimatedCredits],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border/60 bg-background/45 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{label}</p>
              <p className="mt-1 line-clamp-2 text-xs font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="agent-glass-body space-y-4">
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-background/35 px-3 py-2 text-left text-sm font-semibold text-foreground transition-colors hover:border-primary/30"
        >
          <span>Dettagli del piano</span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        {expanded && !editing && (
          <div className="space-y-4">
            {plan.ugcBrief && (
              <section>
                <p className="agent-field-label">UGC brief</p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    ['Product/App URL', plan.ugcBrief.productUrl || 'Da aggiungere'],
                    ['Offer type', plan.ugcBrief.offerType],
                    ['Influencer', plan.ugcBrief.influencerMode.replace(/_/g, ' ')],
                    ['Platform', plan.ugcBrief.platform],
                    ['Format', plan.ugcBrief.aspectRatio],
                    ['Duration', `${plan.ugcBrief.durationSeconds}s`],
                    ['Style', plan.ugcBrief.visualStyle],
                    ['CTA', plan.ugcBrief.callToAction],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border/50 bg-background/35 p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{label}</p>
                      <p className="mt-1 text-xs font-semibold capitalize text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <section>
              <p className="agent-field-label">Strategia</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{plan.strategy}</p>
            </section>
            <section>
              <p className="agent-field-label">Hook</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{plan.hook}</p>
            </section>
            <section>
              <p className="agent-field-label">Script outline</p>
              <div className="mt-2 space-y-2">
                {plan.scriptOutline.map((line, index) => (
                  <div key={`${line}-${index}`} className="flex gap-2 rounded-xl border border-border/50 bg-background/35 p-2.5 text-sm text-muted-foreground">
                    <span className="font-mono text-xs font-bold text-primary">{index + 1}</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <p className="agent-field-label">Shot list</p>
              <div className="mt-2 grid gap-2">
                {plan.shotList.map(step => (
                  <div key={step.title} className="rounded-xl border border-border/50 bg-background/35 p-3">
                    <p className="text-sm font-semibold text-foreground">{step.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.detail}</p>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <p className="agent-field-label">Prompt finale</p>
              <p className="mt-2 rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs leading-5 text-muted-foreground">{plan.finalPrompt}</p>
            </section>
          </div>
        )}

        {editing && (
          <div className="space-y-4">
            {ugcBrief && (
              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-3">
                <div className="mb-3 flex items-center gap-2">
                  <AnimatedIconify icon="solar:shop-bold-duotone" className="h-4 w-4 text-primary" />
                  <p className="agent-field-label">Dettagli UGC modificabili</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="agent-field-label">Nome prodotto/app</p>
                    <input
                      value={ugcBrief.productName}
                      onChange={e => setUgcValue('productName', e.target.value)}
                      placeholder="Nome prodotto, servizio o app"
                      className="agent-glass-input mt-2"
                    />
                  </div>
                  <div>
                    <p className="agent-field-label">URL prodotto/servizio/app</p>
                    <input
                      value={ugcBrief.productUrl}
                      onChange={e => setUgcValue('productUrl', e.target.value)}
                      placeholder="https://..."
                      className="agent-glass-input mt-2"
                    />
                  </div>
                  <div>
                    <p className="agent-field-label">Tipo offerta</p>
                    <select value={ugcBrief.offerType} onChange={e => setUgcValue('offerType', e.target.value as NonNullable<MarketingPlan['ugcBrief']>['offerType'])} className="agent-glass-input mt-2">
                      <option value="product">Product</option>
                      <option value="service">Service</option>
                      <option value="app">App</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <p className="agent-field-label">Influencer</p>
                    <select value={ugcBrief.influencerMode} onChange={e => setUgcValue('influencerMode', e.target.value as NonNullable<MarketingPlan['ugcBrief']>['influencerMode'])} className="agent-glass-input mt-2">
                      <option value="my_influencer">Usa un mio influencer</option>
                      <option value="generate_new">Genera nuovo influencer</option>
                      <option value="upload_creator">Carica creator/foto</option>
                      <option value="no_preference">Nessuna preferenza</option>
                    </select>
                  </div>
                  <div>
                    <p className="agent-field-label">Piattaforma</p>
                    <select value={ugcBrief.platform} onChange={e => setUgcValue('platform', e.target.value as NonNullable<MarketingPlan['ugcBrief']>['platform'])} className="agent-glass-input mt-2">
                      <option value="tiktok">TikTok</option>
                      <option value="instagram">Instagram/Reels</option>
                      <option value="youtube">YouTube Shorts</option>
                      <option value="meta">Meta Ads</option>
                      <option value="multi">Multi-platform</option>
                    </select>
                  </div>
                  <div>
                    <p className="agent-field-label">Formato</p>
                    <select value={ugcBrief.aspectRatio} onChange={e => setUgcValue('aspectRatio', e.target.value as NonNullable<MarketingPlan['ugcBrief']>['aspectRatio'])} className="agent-glass-input mt-2">
                      <option value="9:16">9:16 Vertical</option>
                      <option value="1:1">1:1 Square</option>
                      <option value="16:9">16:9 Horizontal</option>
                    </select>
                  </div>
                  <div>
                    <p className="agent-field-label">Durata</p>
                    <select value={ugcBrief.durationSeconds} onChange={e => setUgcValue('durationSeconds', e.target.value as NonNullable<MarketingPlan['ugcBrief']>['durationSeconds'])} className="agent-glass-input mt-2">
                      <option value="15">15s</option>
                      <option value="30">30s</option>
                      <option value="45">45s</option>
                      <option value="60">60s</option>
                    </select>
                  </div>
                  <div>
                    <p className="agent-field-label">Stile</p>
                    <select value={ugcBrief.visualStyle} onChange={e => setUgcValue('visualStyle', e.target.value as NonNullable<MarketingPlan['ugcBrief']>['visualStyle'])} className="agent-glass-input mt-2">
                      <option value="authentic">Authentic</option>
                      <option value="cinematic">Cinematic</option>
                      <option value="social">Social</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div>
                    <p className="agent-field-label">Lingua</p>
                    <input value={ugcBrief.language} onChange={e => setUgcValue('language', e.target.value)} className="agent-glass-input mt-2" />
                  </div>
                  <div>
                    <p className="agent-field-label">CTA</p>
                    <input value={ugcBrief.callToAction} onChange={e => setUgcValue('callToAction', e.target.value)} className="agent-glass-input mt-2" />
                  </div>
                </div>
              </div>
            )}
            <div>
              <p className="agent-field-label">Modifica script outline</p>
              <textarea value={scriptDraft} onChange={e => setScriptDraft(e.target.value)} className="agent-glass-input mt-2 min-h-[120px]" />
            </div>
            <div>
              <p className="agent-field-label">Modifica shot list</p>
              <textarea value={shotDraft} onChange={e => setShotDraft(e.target.value)} className="agent-glass-input mt-2 min-h-[140px]" />
            </div>
            <div>
              <p className="agent-field-label">Modifica prompt finale</p>
              <textarea value={promptDraft} onChange={e => setPromptDraft(e.target.value)} className="agent-glass-input mt-2 min-h-[150px]" />
            </div>
          </div>
        )}
      </div>

      <div className="agent-glass-footer flex-wrap gap-2">
        <button type="button" onClick={() => onCancel(message.id, req.intent, plan)} className="agent-cancel-btn">
          Annulla
        </button>
        {editing ? (
          <button type="button" onClick={applyEdits} className="agent-confirm-btn">
            <span>Salva modifiche</span>
            <PenLine className="h-4 w-4" />
          </button>
        ) : (
          <>
            <button type="button" onClick={() => setEditing(true)} className="agent-cancel-btn">
              Modifica
            </button>
            <button
              type="button"
              onClick={() => onConfirm(message.id, req.intent, message.prompt ?? '', message.settings ?? {}, plan)}
              className="agent-confirm-btn"
            >
              <span>Accetta piano</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

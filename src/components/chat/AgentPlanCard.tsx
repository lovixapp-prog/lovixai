import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, PenLine, X } from 'lucide-react';
import type { ChatMessage } from '@/hooks/useChat';
import type { Lang, MarketingPlan } from '@/lib/aiRouter';
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

const PLAN_COPY: Record<Lang, {
  actionPlan: string;
  approvedTitle: string;
  approvedBody: string;
  cancelledBody: string;
  deliverable: string;
  format: string;
  duration: string;
  credits: string;
  details: string;
  ugcBrief: string;
  productUrl: string;
  productUrlMissing: string;
  offerType: string;
  influencer: string;
  platform: string;
  style: string;
  cta: string;
  strategy: string;
  hook: string;
  scriptOutline: string;
  shotList: string;
  finalPrompt: string;
  editableUgc: string;
  productName: string;
  productNamePlaceholder: string;
  productUrlField: string;
  productUrlPlaceholder: string;
  offerProduct: string;
  offerService: string;
  offerApp: string;
  offerOther: string;
  influencerMine: string;
  influencerNew: string;
  influencerUpload: string;
  influencerNoPreference: string;
  formatVertical: string;
  formatSquare: string;
  formatHorizontal: string;
  language: string;
  editScript: string;
  editShotList: string;
  editFinalPrompt: string;
  cancel: string;
  saveChanges: string;
  edit: string;
  acceptPlan: string;
}> = {
  en: {
    actionPlan: 'Action plan',
    approvedTitle: 'Plan approved',
    approvedBody: 'LOVIX Agent will continue with the selected workflow.',
    cancelledBody: 'Plan cancelled. You can ask me for a new strategy.',
    deliverable: 'Deliverable',
    format: 'Format',
    duration: 'Duration',
    credits: 'Credits',
    details: 'Plan details',
    ugcBrief: 'UGC brief',
    productUrl: 'Product/App URL',
    productUrlMissing: 'To add',
    offerType: 'Offer type',
    influencer: 'Influencer',
    platform: 'Platform',
    style: 'Style',
    cta: 'CTA',
    strategy: 'Strategy',
    hook: 'Hook',
    scriptOutline: 'Script outline',
    shotList: 'Shot list',
    finalPrompt: 'Final prompt',
    editableUgc: 'Editable UGC details',
    productName: 'Product/app name',
    productNamePlaceholder: 'Product, service, or app name',
    productUrlField: 'Product/service/app URL',
    productUrlPlaceholder: 'https://...',
    offerProduct: 'Product',
    offerService: 'Service',
    offerApp: 'App',
    offerOther: 'Other',
    influencerMine: 'Use one of my influencers',
    influencerNew: 'Generate new influencer',
    influencerUpload: 'Upload creator/photo',
    influencerNoPreference: 'No preference',
    formatVertical: '9:16 Vertical',
    formatSquare: '1:1 Square',
    formatHorizontal: '16:9 Horizontal',
    language: 'Language',
    editScript: 'Edit script outline',
    editShotList: 'Edit shot list',
    editFinalPrompt: 'Edit final prompt',
    cancel: 'Cancel',
    saveChanges: 'Save changes',
    edit: 'Edit',
    acceptPlan: 'Accept plan',
  },
  it: {
    actionPlan: 'Piano d\'azione',
    approvedTitle: 'Piano approvato',
    approvedBody: 'LOVIX Agent procede con il workflow scelto.',
    cancelledBody: 'Piano annullato. Puoi chiedermi una nuova strategia.',
    deliverable: 'Output',
    format: 'Formato',
    duration: 'Durata',
    credits: 'Crediti',
    details: 'Dettagli del piano',
    ugcBrief: 'Brief UGC',
    productUrl: 'URL prodotto/app',
    productUrlMissing: 'Da aggiungere',
    offerType: 'Tipo offerta',
    influencer: 'Influencer',
    platform: 'Piattaforma',
    style: 'Stile',
    cta: 'CTA',
    strategy: 'Strategia',
    hook: 'Hook',
    scriptOutline: 'Schema script',
    shotList: 'Lista scene',
    finalPrompt: 'Prompt finale',
    editableUgc: 'Dettagli UGC modificabili',
    productName: 'Nome prodotto/app',
    productNamePlaceholder: 'Nome prodotto, servizio o app',
    productUrlField: 'URL prodotto/servizio/app',
    productUrlPlaceholder: 'https://...',
    offerProduct: 'Prodotto',
    offerService: 'Servizio',
    offerApp: 'App',
    offerOther: 'Altro',
    influencerMine: 'Usa un mio influencer',
    influencerNew: 'Genera nuovo influencer',
    influencerUpload: 'Carica creator/foto',
    influencerNoPreference: 'Nessuna preferenza',
    formatVertical: '9:16 Verticale',
    formatSquare: '1:1 Quadrato',
    formatHorizontal: '16:9 Orizzontale',
    language: 'Lingua',
    editScript: 'Modifica schema script',
    editShotList: 'Modifica lista scene',
    editFinalPrompt: 'Modifica prompt finale',
    cancel: 'Annulla',
    saveChanges: 'Salva modifiche',
    edit: 'Modifica',
    acceptPlan: 'Accetta piano',
  },
  es: {
    actionPlan: 'Plan de acción',
    approvedTitle: 'Plan aprobado',
    approvedBody: 'LOVIX Agent continuará con el flujo elegido.',
    cancelledBody: 'Plan cancelado. Puedes pedirme una nueva estrategia.',
    deliverable: 'Entregable',
    format: 'Formato',
    duration: 'Duración',
    credits: 'Créditos',
    details: 'Detalles del plan',
    ugcBrief: 'Brief UGC',
    productUrl: 'URL producto/app',
    productUrlMissing: 'Por añadir',
    offerType: 'Tipo de oferta',
    influencer: 'Influencer',
    platform: 'Plataforma',
    style: 'Estilo',
    cta: 'CTA',
    strategy: 'Estrategia',
    hook: 'Hook',
    scriptOutline: 'Guion',
    shotList: 'Lista de tomas',
    finalPrompt: 'Prompt final',
    editableUgc: 'Detalles UGC editables',
    productName: 'Nombre producto/app',
    productNamePlaceholder: 'Nombre de producto, servicio o app',
    productUrlField: 'URL producto/servicio/app',
    productUrlPlaceholder: 'https://...',
    offerProduct: 'Producto',
    offerService: 'Servicio',
    offerApp: 'App',
    offerOther: 'Otro',
    influencerMine: 'Usar uno de mis influencers',
    influencerNew: 'Generar nuevo influencer',
    influencerUpload: 'Subir creator/foto',
    influencerNoPreference: 'Sin preferencia',
    formatVertical: '9:16 Vertical',
    formatSquare: '1:1 Cuadrado',
    formatHorizontal: '16:9 Horizontal',
    language: 'Idioma',
    editScript: 'Editar guion',
    editShotList: 'Editar lista de tomas',
    editFinalPrompt: 'Editar prompt final',
    cancel: 'Cancelar',
    saveChanges: 'Guardar cambios',
    edit: 'Editar',
    acceptPlan: 'Aceptar plan',
  },
  fr: {
    actionPlan: 'Plan d\'action',
    approvedTitle: 'Plan approuvé',
    approvedBody: 'LOVIX Agent continue avec le workflow choisi.',
    cancelledBody: 'Plan annulé. Vous pouvez me demander une nouvelle stratégie.',
    deliverable: 'Livrable',
    format: 'Format',
    duration: 'Durée',
    credits: 'Crédits',
    details: 'Détails du plan',
    ugcBrief: 'Brief UGC',
    productUrl: 'URL produit/app',
    productUrlMissing: 'À ajouter',
    offerType: 'Type d\'offre',
    influencer: 'Influenceur',
    platform: 'Plateforme',
    style: 'Style',
    cta: 'CTA',
    strategy: 'Stratégie',
    hook: 'Hook',
    scriptOutline: 'Plan du script',
    shotList: 'Liste des plans',
    finalPrompt: 'Prompt final',
    editableUgc: 'Détails UGC modifiables',
    productName: 'Nom produit/app',
    productNamePlaceholder: 'Nom du produit, service ou app',
    productUrlField: 'URL produit/service/app',
    productUrlPlaceholder: 'https://...',
    offerProduct: 'Produit',
    offerService: 'Service',
    offerApp: 'App',
    offerOther: 'Autre',
    influencerMine: 'Utiliser un de mes influenceurs',
    influencerNew: 'Générer un nouvel influenceur',
    influencerUpload: 'Importer creator/photo',
    influencerNoPreference: 'Aucune préférence',
    formatVertical: '9:16 Vertical',
    formatSquare: '1:1 Carré',
    formatHorizontal: '16:9 Horizontal',
    language: 'Langue',
    editScript: 'Modifier le script',
    editShotList: 'Modifier la liste des plans',
    editFinalPrompt: 'Modifier le prompt final',
    cancel: 'Annuler',
    saveChanges: 'Enregistrer',
    edit: 'Modifier',
    acceptPlan: 'Accepter le plan',
  },
  de: {
    actionPlan: 'Aktionsplan',
    approvedTitle: 'Plan genehmigt',
    approvedBody: 'LOVIX Agent fährt mit dem gewählten Workflow fort.',
    cancelledBody: 'Plan abgebrochen. Du kannst mich nach einer neuen Strategie fragen.',
    deliverable: 'Ergebnis',
    format: 'Format',
    duration: 'Dauer',
    credits: 'Credits',
    details: 'Plandetails',
    ugcBrief: 'UGC-Brief',
    productUrl: 'Produkt/App URL',
    productUrlMissing: 'Hinzufügen',
    offerType: 'Angebotstyp',
    influencer: 'Influencer',
    platform: 'Plattform',
    style: 'Stil',
    cta: 'CTA',
    strategy: 'Strategie',
    hook: 'Hook',
    scriptOutline: 'Script-Outline',
    shotList: 'Shot-Liste',
    finalPrompt: 'Finaler Prompt',
    editableUgc: 'Bearbeitbare UGC-Details',
    productName: 'Produkt/App Name',
    productNamePlaceholder: 'Name von Produkt, Service oder App',
    productUrlField: 'Produkt/Service/App URL',
    productUrlPlaceholder: 'https://...',
    offerProduct: 'Produkt',
    offerService: 'Service',
    offerApp: 'App',
    offerOther: 'Andere',
    influencerMine: 'Einen meiner Influencer nutzen',
    influencerNew: 'Neuen Influencer generieren',
    influencerUpload: 'Creator/Foto hochladen',
    influencerNoPreference: 'Keine Präferenz',
    formatVertical: '9:16 Vertikal',
    formatSquare: '1:1 Quadrat',
    formatHorizontal: '16:9 Horizontal',
    language: 'Sprache',
    editScript: 'Script bearbeiten',
    editShotList: 'Shot-Liste bearbeiten',
    editFinalPrompt: 'Finalen Prompt bearbeiten',
    cancel: 'Abbrechen',
    saveChanges: 'Änderungen speichern',
    edit: 'Bearbeiten',
    acceptPlan: 'Plan akzeptieren',
  },
  pt: {
    actionPlan: 'Plano de ação',
    approvedTitle: 'Plano aprovado',
    approvedBody: 'LOVIX Agent continuará com o workflow escolhido.',
    cancelledBody: 'Plano cancelado. Você pode pedir uma nova estratégia.',
    deliverable: 'Entregável',
    format: 'Formato',
    duration: 'Duração',
    credits: 'Créditos',
    details: 'Detalhes do plano',
    ugcBrief: 'Brief UGC',
    productUrl: 'URL produto/app',
    productUrlMissing: 'A adicionar',
    offerType: 'Tipo de oferta',
    influencer: 'Influencer',
    platform: 'Plataforma',
    style: 'Estilo',
    cta: 'CTA',
    strategy: 'Estratégia',
    hook: 'Hook',
    scriptOutline: 'Roteiro',
    shotList: 'Lista de cenas',
    finalPrompt: 'Prompt final',
    editableUgc: 'Detalhes UGC editáveis',
    productName: 'Nome produto/app',
    productNamePlaceholder: 'Nome do produto, serviço ou app',
    productUrlField: 'URL produto/serviço/app',
    productUrlPlaceholder: 'https://...',
    offerProduct: 'Produto',
    offerService: 'Serviço',
    offerApp: 'App',
    offerOther: 'Outro',
    influencerMine: 'Usar um dos meus influencers',
    influencerNew: 'Gerar novo influencer',
    influencerUpload: 'Enviar creator/foto',
    influencerNoPreference: 'Sem preferência',
    formatVertical: '9:16 Vertical',
    formatSquare: '1:1 Quadrado',
    formatHorizontal: '16:9 Horizontal',
    language: 'Idioma',
    editScript: 'Editar roteiro',
    editShotList: 'Editar lista de cenas',
    editFinalPrompt: 'Editar prompt final',
    cancel: 'Cancelar',
    saveChanges: 'Salvar alterações',
    edit: 'Editar',
    acceptPlan: 'Aceitar plano',
  },
};

function getPlanCopy(_prompt?: string): (typeof PLAN_COPY)[Lang] {
  return PLAN_COPY.en;
}

function splitLines(value: string): string[] {
  return value.split('\n').map(line => line.trim()).filter(Boolean);
}

export function AgentPlanCard({ message, onConfirm, onCancel }: AgentPlanCardProps) {
  const req = message.agentPlan!;
  const t = getPlanCopy(message.prompt);
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
            <p className="text-sm font-semibold text-foreground">{t.approvedTitle}</p>
            <p className="text-xs text-muted-foreground">{t.approvedBody}</p>
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
          <p className="text-sm text-muted-foreground">{t.cancelledBody}</p>
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
                {t.actionPlan}
              </span>
            </div>
            <h3 className="mt-1 font-display text-lg font-bold text-foreground">{plan.title}</h3>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{req.intro || plan.summary}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            [t.deliverable, plan.deliverable],
            [t.format, plan.format],
            [t.duration, plan.duration],
            [t.credits, plan.estimatedCredits],
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
          <span>{t.details}</span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        {expanded && !editing && (
          <div className="space-y-4">
            {plan.ugcBrief && (
              <section>
                <p className="agent-field-label">{t.ugcBrief}</p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    [t.productUrl, plan.ugcBrief.productUrl || t.productUrlMissing],
                    [t.offerType, plan.ugcBrief.offerType],
                    [t.influencer, plan.ugcBrief.influencerMode.replace(/_/g, ' ')],
                    [t.platform, plan.ugcBrief.platform],
                    [t.format, plan.ugcBrief.aspectRatio],
                    [t.duration, `${plan.ugcBrief.durationSeconds}s`],
                    [t.style, plan.ugcBrief.visualStyle],
                    [t.cta, plan.ugcBrief.callToAction],
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
              <p className="agent-field-label">{t.strategy}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{plan.strategy}</p>
            </section>
            <section>
              <p className="agent-field-label">{t.hook}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{plan.hook}</p>
            </section>
            <section>
              <p className="agent-field-label">{t.scriptOutline}</p>
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
              <p className="agent-field-label">{t.shotList}</p>
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
              <p className="agent-field-label">{t.finalPrompt}</p>
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
                  <p className="agent-field-label">{t.editableUgc}</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="agent-field-label">{t.productName}</p>
                    <input
                      value={ugcBrief.productName}
                      onChange={e => setUgcValue('productName', e.target.value)}
                      placeholder={t.productNamePlaceholder}
                      className="agent-glass-input mt-2"
                    />
                  </div>
                  <div>
                    <p className="agent-field-label">{t.productUrlField}</p>
                    <input
                      value={ugcBrief.productUrl}
                      onChange={e => setUgcValue('productUrl', e.target.value)}
                      placeholder={t.productUrlPlaceholder}
                      className="agent-glass-input mt-2"
                    />
                  </div>
                  <div>
                    <p className="agent-field-label">{t.offerType}</p>
                    <select value={ugcBrief.offerType} onChange={e => setUgcValue('offerType', e.target.value as NonNullable<MarketingPlan['ugcBrief']>['offerType'])} className="agent-glass-input mt-2">
                      <option value="product">{t.offerProduct}</option>
                      <option value="service">{t.offerService}</option>
                      <option value="app">{t.offerApp}</option>
                      <option value="other">{t.offerOther}</option>
                    </select>
                  </div>
                  <div>
                    <p className="agent-field-label">{t.influencer}</p>
                    <select value={ugcBrief.influencerMode} onChange={e => setUgcValue('influencerMode', e.target.value as NonNullable<MarketingPlan['ugcBrief']>['influencerMode'])} className="agent-glass-input mt-2">
                      <option value="my_influencer">{t.influencerMine}</option>
                      <option value="generate_new">{t.influencerNew}</option>
                      <option value="upload_creator">{t.influencerUpload}</option>
                      <option value="no_preference">{t.influencerNoPreference}</option>
                    </select>
                  </div>
                  <div>
                    <p className="agent-field-label">{t.platform}</p>
                    <select value={ugcBrief.platform} onChange={e => setUgcValue('platform', e.target.value as NonNullable<MarketingPlan['ugcBrief']>['platform'])} className="agent-glass-input mt-2">
                      <option value="tiktok">TikTok</option>
                      <option value="instagram">Instagram/Reels</option>
                      <option value="youtube">YouTube Shorts</option>
                      <option value="meta">Meta Ads</option>
                      <option value="multi">Multi-platform</option>
                    </select>
                  </div>
                  <div>
                    <p className="agent-field-label">{t.format}</p>
                    <select value={ugcBrief.aspectRatio} onChange={e => setUgcValue('aspectRatio', e.target.value as NonNullable<MarketingPlan['ugcBrief']>['aspectRatio'])} className="agent-glass-input mt-2">
                      <option value="9:16">{t.formatVertical}</option>
                      <option value="1:1">{t.formatSquare}</option>
                      <option value="16:9">{t.formatHorizontal}</option>
                    </select>
                  </div>
                  <div>
                    <p className="agent-field-label">{t.duration}</p>
                    <select value={ugcBrief.durationSeconds} onChange={e => setUgcValue('durationSeconds', e.target.value as NonNullable<MarketingPlan['ugcBrief']>['durationSeconds'])} className="agent-glass-input mt-2">
                      <option value="15">15s</option>
                      <option value="30">30s</option>
                      <option value="45">45s</option>
                      <option value="60">60s</option>
                    </select>
                  </div>
                  <div>
                    <p className="agent-field-label">{t.style}</p>
                    <select value={ugcBrief.visualStyle} onChange={e => setUgcValue('visualStyle', e.target.value as NonNullable<MarketingPlan['ugcBrief']>['visualStyle'])} className="agent-glass-input mt-2">
                      <option value="authentic">Authentic</option>
                      <option value="cinematic">Cinematic</option>
                      <option value="social">Social</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div>
                    <p className="agent-field-label">{t.language}</p>
                    <input value={ugcBrief.language} onChange={e => setUgcValue('language', e.target.value)} className="agent-glass-input mt-2" />
                  </div>
                  <div>
                    <p className="agent-field-label">{t.cta}</p>
                    <input value={ugcBrief.callToAction} onChange={e => setUgcValue('callToAction', e.target.value)} className="agent-glass-input mt-2" />
                  </div>
                </div>
              </div>
            )}
            <div>
              <p className="agent-field-label">{t.editScript}</p>
              <textarea value={scriptDraft} onChange={e => setScriptDraft(e.target.value)} className="agent-glass-input mt-2 min-h-[120px]" />
            </div>
            <div>
              <p className="agent-field-label">{t.editShotList}</p>
              <textarea value={shotDraft} onChange={e => setShotDraft(e.target.value)} className="agent-glass-input mt-2 min-h-[140px]" />
            </div>
            <div>
              <p className="agent-field-label">{t.editFinalPrompt}</p>
              <textarea value={promptDraft} onChange={e => setPromptDraft(e.target.value)} className="agent-glass-input mt-2 min-h-[150px]" />
            </div>
          </div>
        )}
      </div>

      <div className="agent-glass-footer flex-wrap gap-2">
        <button type="button" onClick={() => onCancel(message.id, req.intent, plan)} className="agent-cancel-btn">
          {t.cancel}
        </button>
        {editing ? (
          <button type="button" onClick={applyEdits} className="agent-confirm-btn">
            <span>{t.saveChanges}</span>
            <PenLine className="h-4 w-4" />
          </button>
        ) : (
          <>
            <button type="button" onClick={() => setEditing(true)} className="agent-cancel-btn">
              {t.edit}
            </button>
            <button
              type="button"
              onClick={() => onConfirm(message.id, req.intent, message.prompt ?? '', message.settings ?? {}, plan)}
              className="agent-confirm-btn"
            >
              <span>{t.acceptPlan}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

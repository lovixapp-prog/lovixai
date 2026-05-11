export type AIIntent =
  | 'video'
  | 'image'
  | 'ugc'
  | 'influencer'
  | 'motion'
  | 'creations'
  | 'assets'
  | 'credits'
  | 'chat';

export interface AgentFieldOption {
  value: string;
  label: string;
  emoji?: string;
}

export interface AgentField {
  id: string;
  type: 'file_upload' | 'text' | 'select' | 'textarea';
  label: string;
  subtitle?: string;
  placeholder?: string;
  required: boolean;
  options?: AgentFieldOption[];
  accept?: string;
}

export interface MarketingPlanStep {
  title: string;
  detail: string;
}

export interface MarketingPlan {
  title: string;
  summary: string;
  strategy: string;
  deliverable: string;
  format: string;
  duration: string;
  audience: string;
  hook: string;
  scriptOutline: string[];
  shotList: MarketingPlanStep[];
  productionNotes: string[];
  finalPrompt: string;
  riskNotes: string[];
  estimatedCredits: string;
  ugcBrief?: {
    productName: string;
    productUrl: string;
    offerType: 'product' | 'service' | 'app' | 'other';
    influencerMode: 'my_influencer' | 'generate_new' | 'upload_creator' | 'no_preference';
    platform: 'tiktok' | 'instagram' | 'youtube' | 'meta' | 'multi';
    aspectRatio: '9:16' | '1:1' | '16:9';
    durationSeconds: '15' | '30' | '45' | '60';
    visualStyle: 'authentic' | 'cinematic' | 'social' | 'premium';
    language: string;
    callToAction: string;
  };
}

export interface RouterResult {
  intent: AIIntent;
  confidence: number;
  prompt: string;
  settings: Record<string, unknown>;
  responseText?: string;
  needsInfo?: boolean;
  agentFields?: AgentField[];
  needsPlan?: boolean;
  plan?: MarketingPlan;
}

/* ─── Agent field definitions ─────────────────────────────────── */

const MOTION_FIELDS: AgentField[] = [
  {
    id: 'source_asset',
    type: 'file_upload',
    label: 'Asset to Animate',
    subtitle: 'Upload a video or image you want to bring to life',
    required: true,
    accept: 'video/*,image/jpeg,image/png,image/webp',
  },
  {
    id: 'motion_style',
    type: 'select',
    label: 'Motion Style',
    required: false,
    options: [
      { value: 'float', label: 'Subtle Float', emoji: '🌊' },
      { value: 'zoom', label: 'Zoom In', emoji: '🔍' },
      { value: 'pan', label: 'Cinematic Pan', emoji: '🎞️' },
      { value: 'lipsync', label: 'Lip Sync', emoji: '🎤' },
    ],
  },
];

const UGC_FIELDS: AgentField[] = [
  {
    id: 'productName',
    type: 'text',
    label: 'Product Name',
    subtitle: 'Name of the product you want to promote',
    placeholder: 'e.g. "AuraSkin Anti-Aging Serum" or "Nike Air Max"',
    required: true,
  },
  {
    id: 'script',
    type: 'textarea',
    label: 'Ad Script',
    subtitle: 'What should the creator say? (15–30 seconds)',
    placeholder: 'e.g. "This serum changed my skin in 7 days — I can\'t believe the results..."',
    required: true,
  },
  {
    id: 'ad_style',
    type: 'select',
    label: 'Visual Style',
    required: false,
    options: [
      { value: 'authentic', label: 'Authentic & Candid', emoji: '😊' },
      { value: 'cinematic', label: 'Cinematic & Premium', emoji: '🎬' },
      { value: 'social', label: 'Social Media', emoji: '📱' },
    ],
  },
  {
    id: 'influencer_image',
    type: 'file_upload',
    label: 'Creator Image',
    subtitle: 'Optional — upload an AI influencer photo as the creator',
    required: false,
    accept: 'image/jpeg,image/png,image/webp',
  },
];

const INFLUENCER_FIELDS: AgentField[] = [
  {
    id: 'name',
    type: 'text',
    label: 'Influencer Name',
    subtitle: 'Give your AI influencer a name',
    placeholder: 'Luna, Alex, Zara, Nova...',
    required: false,
  },
  {
    id: 'gender',
    type: 'select',
    label: 'Avatar Style',
    required: true,
    options: [
      { value: 'female', label: 'Female', emoji: '👩‍🎤' },
      { value: 'male', label: 'Male', emoji: '👨‍🎤' },
    ],
  },
  {
    id: 'niche',
    type: 'select',
    label: 'Content Niche',
    required: true,
    options: [
      { value: 'fashion', label: 'Fashion & Style', emoji: '👗' },
      { value: 'fitness', label: 'Fitness & Health', emoji: '💪' },
      { value: 'tech', label: 'Tech & Gaming', emoji: '🎮' },
      { value: 'food', label: 'Food & Lifestyle', emoji: '🍃' },
      { value: 'business', label: 'Business & Finance', emoji: '📈' },
    ],
  },
  {
    id: 'aesthetic',
    type: 'select',
    label: 'Visual Aesthetic',
    required: false,
    options: [
      { value: 'hyper_realistic', label: 'Hyper Realistic', emoji: '📸' },
      { value: 'editorial', label: 'Editorial', emoji: '🎨' },
      { value: 'luxury', label: 'Luxury', emoji: '💎' },
      { value: 'casual', label: 'Casual', emoji: '☀️' },
    ],
  },
];

/* ─── Language system ─────────────────────────────────────────── */

const INTENTS: { id: AIIntent; keywords: string[] }[] = [
  {
    // motion before video: wins ties when 'motion' + 'video' both appear
    id: 'motion',
    keywords: [
      'motion', 'lip sync', 'lipsync', 'animate this', 'animate my',
      'motion control', 'motion transfer', 'make talk', 'talking avatar',
      'motion effect', 'motion video', 'video motion', 'apply motion',
      'add motion', 'motion to', 'animate image',
      'sincronizza labbra', 'trasferisci motion', 'applica motion',
      'motion al', 'motion a ', 'motion su', 'effetto motion',
      'anima questa', 'anima il', 'anima questo', 'anima la',
      'fai parlare', 'metti motion', 'aggiungi motion',
      'animazione su', 'crea motion', 'voglio motion',
      'anima ', 'animazione',
    ],
  },
  {
    id: 'video',
    keywords: [
      'video', 'film', 'clip', 'movie', 'tiktok', 'reel',
      'footage', 'cinematic', 'create a video', 'make a video', 'generate video',
      'short video', 'video of', 'record', 'text to video', 'image to video',
      'crea un video', 'crea video', 'genera video', 'generami un video',
      'generami video', 'fammi un video', 'fai un video', 'fai video',
      'video di', 'clip di', 'un video',
    ],
  },
  {
    id: 'ugc',
    keywords: [
      'ugc', 'product video', 'product ad', 'ad video', 'advertisement',
      'commercial', 'unboxing', 'review video', 'marketing video',
      'video prodotto', 'spot', 'pubblicità', 'video pubblicitario',
      'video marketing', 'video ugc', 'video per il prodotto',
    ],
  },
  {
    id: 'influencer',
    keywords: [
      'influencer', 'avatar', 'ai influencer', 'virtual influencer',
      'ai model', 'ai persona', 'create influencer', 'make influencer',
      'crea influencer', 'crea un influencer', 'influencer virtuale',
      'modello ai', 'persona virtuale',
    ],
  },
  {
    id: 'image',
    keywords: [
      'image', 'photo', 'picture', 'draw', 'illustration', 'render',
      'design', 'logo', 'poster', 'artwork', 'painting', 'visual',
      'generate image', 'create image', 'make image', 'photograph',
      'generate a', 'create a', 'make a',
      'immagine', 'foto', 'fotografia', 'disegno', 'disegna',
      'illustrazione', 'crea un immagine', "crea un'immagine",
      'genera immagine', 'genera un immagine', "genera un'immagine",
      'generami immagine', "generami un'immagine", 'generami un immagine',
      'fammi immagine', "fammi un'immagine", 'fammi un immagine',
      'crea immagine', 'fai immagine', 'fai un immagine', "fai un'immagine",
      'disegnami', 'disegna un', 'dipingi', 'poster di', 'logo di',
    ],
  },
  {
    id: 'creations',
    keywords: [
      'my creations', 'my videos', 'my images', 'my generations',
      'show creations', 'view creations', 'past creations',
      'mie creazioni', 'i miei video', 'le mie immagini', 'miei video',
      'mostra creazioni', 'vedi creazioni',
    ],
  },
  {
    id: 'assets',
    keywords: [
      'my assets', 'my files', 'my uploads', 'uploaded files',
      'view assets', 'show assets',
      'miei file', 'i miei file', 'caricamenti', 'miei asset',
    ],
  },
  {
    id: 'credits',
    keywords: [
      'credits', 'subscription', 'plans', 'pricing', 'upgrade plan',
      'how many credits', 'buy credits', 'my plan',
      'crediti', 'abbonamento', 'piano', 'piani', 'prezzi',
      'quanti crediti', 'comprare crediti', 'upgrade',
    ],
  },
];

function score(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((s, kw) => (lower.includes(kw) ? s + 1 : s), 0);
}

function extractVideoSettings(text: string): Record<string, unknown> {
  const lower = text.toLowerCase();
  const settings: Record<string, unknown> = {};
  if (lower.includes('9:16') || lower.includes('vertical') || lower.includes('portrait') || lower.includes('tiktok') || lower.includes('reels') || lower.includes('story')) {
    settings.aspectRatio = '9:16';
  } else if (lower.includes('1:1') || lower.includes('square')) {
    settings.aspectRatio = '1:1';
  } else {
    settings.aspectRatio = '16:9';
  }
  settings.seconds = (lower.includes('10 second') || lower.includes('10s') || lower.includes('long')) ? 10 : 5;
  settings.quality = lower.includes('4k') ? '4k' : 'hd';
  return settings;
}

function extractImageSettings(text: string): Record<string, unknown> {
  const lower = text.toLowerCase();
  if (lower.includes('artistic') || lower.includes('painting') || lower.includes('art style')) return { style: 'artistic' };
  if (lower.includes('anime') || lower.includes('cartoon') || lower.includes('manga')) return { style: 'anime' };
  if (lower.includes('3d') || lower.includes('render')) return { style: '3d' };
  return { style: 'photorealistic' };
}

function isComplexCreativeRequest(text: string, intent: AIIntent): boolean {
  if (!['video', 'ugc', 'motion', 'image'].includes(intent)) return false;
  const lower = text.toLowerCase();
  const complexityMarkers = [
    'complesso', 'complessa', 'strano', 'strana', 'lungo', 'lunga', 'campagna',
    'storyboard', 'script', 'sceneggiatura', 'marketing', 'brand', 'prodotto',
    'ads', 'pubblicitario', 'pubblicità', 'ugc', 'funnel', 'hook', 'cta',
    'complex', 'weird', 'long', 'campaign', 'advertising', 'commercial',
    'conversion', 'launch', 'multi scene', 'multiple scenes',
  ];
  const markerScore = complexityMarkers.reduce((total, marker) => total + (lower.includes(marker) ? 1 : 0), 0);
  const wordCount = lower.split(/\s+/).filter(Boolean).length;
  return markerScore >= 2 || wordCount >= 28;
}

function extractAudience(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('tiktok') || lower.includes('reel') || lower.includes('short')) return 'Social-first audience on TikTok, Reels, and Shorts';
  if (lower.includes('b2b') || lower.includes('saas')) return 'B2B buyers who need a fast, credible reason to trust the offer';
  if (lower.includes('skincare') || lower.includes('beauty')) return 'Beauty shoppers looking for proof, transformation, and authenticity';
  if (lower.includes('fitness')) return 'Fitness buyers motivated by visible outcomes and practical demos';
  return 'Cold social audience that needs a sharp hook, fast proof, and a clear next action';
}

function extractAudienceIt(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('tiktok') || lower.includes('reel') || lower.includes('short')) return 'Pubblico social-first su TikTok, Reels e Shorts';
  if (lower.includes('b2b') || lower.includes('saas')) return 'Buyer B2B che hanno bisogno di un motivo rapido e credibile per fidarsi';
  if (lower.includes('skincare') || lower.includes('beauty')) return 'Clienti beauty interessati a prova, trasformazione e autenticità';
  if (lower.includes('fitness')) return 'Clienti fitness motivati da risultati visibili e demo pratiche';
  return 'Pubblico freddo sui social che ha bisogno di hook forte, prova rapida e una CTA chiara';
}

function buildMarketingPlan(text: string, intent: AIIntent, settings: Record<string, unknown>): MarketingPlan {
  const lower = text.toLowerCase();
  const lang = detectLang(text);
  const isIt = lang === 'it';
  const isUgc = intent === 'ugc' || lower.includes('ugc') || lower.includes('prodotto') || lower.includes('product');
  const isVertical = String(settings.aspectRatio ?? '').includes('9:16') || lower.includes('tiktok') || lower.includes('reel');
  const duration = isUgc
    ? (lower.includes('lungo') || lower.includes('long')
        ? (isIt ? 'Concept UGC 45-60s, diviso in scene brevi e forti' : '45-60s UGC concept, split into punchy scenes')
        : (isIt ? 'UGC ad 20-30s' : '20-30s UGC ad'))
    : (lower.includes('lungo') || lower.includes('long')
        ? (isIt ? 'Concept cinematografico 30-45s' : '30-45s cinematic concept')
        : `${settings.seconds ?? 8}s ${isIt ? 'video AI' : 'AI video'}`);

  const title = isUgc
    ? (isIt ? 'Piano d\'azione marketing UGC' : 'UGC Marketing Action Plan')
    : intent === 'motion'
      ? (isIt ? 'Piano d\'azione contenuto motion' : 'Motion Content Action Plan')
      : (isIt ? 'Piano d\'azione video creativo' : 'Creative Video Action Plan');
  const format = isVertical
    ? (isIt ? 'Formato social verticale 9:16' : '9:16 vertical social format')
    : `${settings.aspectRatio ?? '16:9'} ${isIt ? 'formato campagna' : 'campaign format'}`;
  const hook = isUgc
    ? (isIt ? 'Apri con un pattern interrupt: il creator mostra il problema prima di nominare il prodotto.' : 'Open with a pattern interrupt: a creator shows the problem before naming the product.')
    : (isIt ? 'Apri con un frame impossibile o sorprendente, poi rivela il concetto in movimento.' : 'Open with one impossible or visually surprising frame, then reveal the concept in motion.');

  const scriptOutline = isUgc
    ? (isIt ? [
        '0-3s: hook problema/confessione per fermare lo scroll',
        '3-10s: il prodotto entra naturalmente nella routine del creator',
        '10-22s: prova, demo, trasformazione o confronto',
        '22-30s: CTA chiara con un beneficio ripetuto in parole semplici',
      ] : [
        '0-3s: scroll-stopping problem or confession hook',
        '3-10s: product appears naturally inside the creator routine',
        '10-22s: proof, demo, transformation, or comparison',
        '22-30s: clear CTA with one benefit repeated in simple words',
      ])
    : (isIt ? [
        'Apertura: shock visivo o reveal cinematografico',
        'Sviluppo: 2-3 momenti collegati che spiegano l’idea senza sovraccaricare',
        'Picco: trasformazione visual/motion più memorabile',
        'Chiusura: momento logo/prodotto/CTA con spazio negativo pulito',
      ] : [
        'Opening: visual shock or cinematic reveal',
        'Build: 2-3 connected beats that explain the idea without overloading the viewer',
        'Peak: the most memorable motion/visual transformation',
        'Close: logo/product/CTA moment with clean negative space',
      ]);

  const shotList = isUgc
    ? (isIt ? [
        { title: 'Hook', detail: 'Inquadratura creator ravvicinata, handheld, contatto visivo diretto e caption veloci.' },
        { title: 'Prova prodotto', detail: 'Mostra il prodotto in uso con un dettaglio tattile che il pubblico capisce subito.' },
        { title: 'Risultato', detail: 'Mostra after-state, social proof o payoff emotivo in un visual pulito.' },
        { title: 'Frame CTA', detail: 'Chiudi con hero shot del prodotto e una frase d’azione breve.' },
      ] : [
        { title: 'Hook Shot', detail: 'Close, handheld creator framing with direct eye contact and fast caption energy.' },
        { title: 'Product Proof', detail: 'Show the product in use, with one tactile detail viewers can instantly understand.' },
        { title: 'Outcome Scene', detail: 'Show the after-state, social proof, or emotional payoff in one clean visual.' },
        { title: 'CTA Frame', detail: 'End with a simple product hero shot and a short action line.' },
      ])
    : (isIt ? [
        { title: 'Frame iniziale', detail: 'Definisci mondo, soggetto, luce e mood nel primo secondo.' },
        { title: 'Beat motion', detail: 'Usa movimento camera o trasformazione del soggetto per dare vita all’idea.' },
        { title: 'Momento signature', detail: 'Crea un beat visivo strano, memorabile e condivisibile.' },
        { title: 'Frame finale', detail: 'Chiudi con una composizione hero pulita pronta per i social.' },
      ] : [
        { title: 'Establishing Frame', detail: 'Define world, subject, lighting, and mood in the first second.' },
        { title: 'Motion Beat', detail: 'Use camera motion or subject transformation to make the idea feel alive.' },
        { title: 'Signature Moment', detail: 'Create one strange, memorable, shareable visual beat.' },
        { title: 'Final Frame', detail: 'Resolve with a clean hero composition ready for social posting.' },
      ]);

  const finalPrompt = [
    text.trim(),
    `${isIt ? 'Formato' : 'Format'}: ${format}.`,
    `${isIt ? 'Durata' : 'Duration'}: ${duration}.`,
    `${isIt ? 'Direzione creativa' : 'Creative direction'}: ${isUgc
      ? (isIt ? 'UGC ad autentico guidato da creator, ritmo ad alta retention, prova prodotto naturale' : 'authentic creator-led UGC ad, high-retention pacing, natural product proof')
      : (isIt ? 'video marketing cinematografico, luce premium, forte continuità visiva' : 'cinematic marketing video, premium lighting, strong visual continuity')}.`,
    `${isIt ? 'Hook' : 'Hook'}: ${hook}`,
    `${isIt ? 'Piano scene' : 'Shot plan'}: ${shotList.map(s => `${s.title} - ${s.detail}`).join(' | ')}`,
    isIt
      ? 'Mantieni ritmo chiaro, evita confusione visiva e rendi il frame finale usabile come asset di campagna.'
      : 'Keep pacing clear, avoid clutter, make the final frame usable as a campaign asset.',
  ].join(' ');

  const ugcBrief = isUgc ? {
    productName: '',
    productUrl: '',
    offerType: lower.includes('app') ? 'app' as const : lower.includes('servizio') || lower.includes('service') ? 'service' as const : 'product' as const,
    influencerMode: 'my_influencer' as const,
    platform: lower.includes('youtube') ? 'youtube' as const : lower.includes('instagram') || lower.includes('reel') ? 'instagram' as const : lower.includes('facebook') || lower.includes('meta') ? 'meta' as const : lower.includes('tiktok') ? 'tiktok' as const : 'multi' as const,
    aspectRatio: isVertical ? '9:16' as const : '16:9' as const,
    durationSeconds: lower.includes('60') || lower.includes('lungo') || lower.includes('long') ? '60' as const : lower.includes('45') ? '45' as const : lower.includes('15') ? '15' as const : '30' as const,
    visualStyle: lower.includes('cinematic') || lower.includes('cinematograf') ? 'cinematic' as const : lower.includes('premium') || lower.includes('luxury') ? 'premium' as const : lower.includes('social') ? 'social' as const : 'authentic' as const,
    language: isIt ? 'Italiano' : 'English',
    callToAction: lower.includes('download') || lower.includes('scarica') ? 'Download now' : lower.includes('demo') ? 'Book a demo' : 'Shop now',
  } : undefined;

  return {
    title,
    summary: isUgc
      ? (isIt ? 'Trasformo la richiesta in un concept UGC strutturato con hook, prova, scene, CTA e direzione pronta per la generazione.' : 'I will turn this into a structured UGC concept with hook, proof, scenes, CTA, and generation-ready direction.')
      : (isIt ? 'Trasformo questa idea complessa in una sequenza creativa controllata prima di generare.' : 'I will turn this complex idea into a controlled creative sequence before generating anything.'),
    strategy: isUgc
      ? (isIt ? 'Angolo marketing: problema -> prova prodotto -> trasformazione credibile -> CTA diretta.' : 'Marketing angle: problem -> product proof -> believable transformation -> direct CTA.')
      : (isIt ? 'Angolo creativo: una forte idea visiva, ritmo controllato e frame finale intenzionale.' : 'Creative angle: one strong visual idea, controlled pacing, and a final frame that feels intentional.'),
    deliverable: isUgc ? (isIt ? 'Concept UGC ad + prompt di generazione' : 'UGC ad concept + generation prompt') : (isIt ? 'Concept video AI + prompt di generazione' : 'AI video concept + generation prompt'),
    format,
    duration,
    audience: isIt ? extractAudienceIt(text) : extractAudience(text),
    hook,
    scriptOutline,
    shotList,
    productionNotes: [
      isIt ? 'Mantieni le scene leggibili su mobile con soggetti grandi e sfondi semplici.' : 'Keep scenes readable on mobile with large subjects and simple backgrounds.',
      isIt ? 'Usa caption o beat visivi ogni 2-3 secondi per la retention.' : 'Use captions or visual beats every 2-3 seconds for retention.',
      isIt ? 'Preserva uno stile visivo coerente dal primo frame alla CTA finale.' : 'Preserve one consistent visual style from first frame to final CTA.',
    ],
    finalPrompt,
    riskNotes: [
      isIt ? 'Se mancano dettagli prodotto, li chiederò prima della generazione UGC.' : 'If product details are missing, I will ask for them before UGC generation.',
      isIt ? 'I concept molto lunghi funzionano meglio come più scene brevi per qualità superiore.' : 'Very long concepts should be generated as multiple shorter scenes for better quality.',
    ],
    estimatedCredits: isUgc ? (isIt ? '~225-450 crediti in base alla durata' : '~225-450 credits depending on duration') : (isIt ? '~5-10 crediti in base a durata e qualità' : '~5-10 credits depending on duration and quality'),
    ugcBrief,
  };
}

export type Lang = 'it' | 'es' | 'fr' | 'de' | 'pt' | 'en';

const LANG_MARKERS: [Lang, string[]][] = [
  ['it', ['crea', 'genera', 'generami', 'fammi', 'vorrei', 'voglio', 'puoi', 'ciao', 'grazie', 'per favore', 'immagine', 'dimmi', 'mostrami', 'fai un', 'un video', 'un immagine']],
  ['es', ['crea', 'crear', 'genera', 'generar', 'hazme', 'quiero', 'puedes', 'hola', 'gracias', 'por favor', 'imagen', 'foto', 'video de', 'un video', 'una imagen']],
  ['fr', ['crée', 'créer', 'génère', 'générer', 'fais', 'veux', 'peux', 'bonjour', 'merci', 's\'il vous plaît', 'image', 'photo', 'une vidéo', 'une image']],
  ['de', ['erstelle', 'erstell', 'generiere', 'mach', 'möchte', 'kannst', 'hallo', 'danke', 'bitte', 'bild', 'foto', 'ein video', 'ein bild']],
  ['pt', ['cria', 'criar', 'gera', 'gerar', 'faça', 'quero', 'posso', 'olá', 'obrigado', 'por favor', 'imagem', 'foto', 'um vídeo', 'uma imagem']],
];

export function detectLang(text: string): Lang {
  const lower = text.toLowerCase();
  const tokens = lower.split(/[^\p{L}]+/u).filter(Boolean);
  for (const [lang, markers] of LANG_MARKERS) {
    if (markers.some(m => m.includes(' ') ? lower.includes(m) : tokens.includes(m))) return lang;
  }
  return 'en';
}

const AGENT_INTROS: Record<string, Record<Lang, string>> = {
  motion: {
    en: "To create a stunning motion effect, I need your source asset and a few details.",
    it: "Per creare un motion effect straordinario, ho bisogno dell'asset da animare e qualche dettaglio.",
    es: "Para crear un efecto de movimiento impresionante, necesito tu recurso y algunos detalles.",
    fr: "Pour créer un effet de mouvement époustouflant, j'ai besoin de votre asset et de quelques détails.",
    de: "Um einen beeindruckenden Motion-Effekt zu erstellen, benötige ich dein Asset und einige Details.",
    pt: "Para criar um efeito de movimento incrível, preciso do seu asset e alguns detalhes.",
  },
  ugc: {
    en: "To craft a high-converting UGC ad, tell me about your product and preferences.",
    it: "Per creare un UGC ad ad alto rendimento, dimmi del tuo prodotto e delle tue preferenze.",
    es: "Para crear un anuncio UGC de alta conversión, cuéntame sobre tu producto y preferencias.",
    fr: "Pour créer une publicité UGC à forte conversion, parlez-moi de votre produit et vos préférences.",
    de: "Um eine hochkonvertierende UGC-Werbung zu erstellen, erzähle mir von deinem Produkt und deinen Wünschen.",
    pt: "Para criar um anúncio UGC de alta conversão, conte-me sobre o seu produto e preferências.",
  },
  influencer: {
    en: "Let's design your perfect AI influencer — a few details to create something iconic.",
    it: "Progettiamo il tuo AI influencer perfetto — qualche dettaglio per creare qualcosa di iconico.",
    es: "Diseñemos tu perfecto influencer AI — algunos detalles para crear algo icónico.",
    fr: "Concevons votre parfait influenceur AI — quelques détails pour créer quelque chose d'iconique.",
    de: "Lass uns deinen perfekten KI-Influencer entwerfen — einige Details für etwas Ikonisches.",
    pt: "Vamos criar o seu influencer AI perfeito — alguns detalhes para criar algo icônico.",
  },
};

type LangResponses = {
  greeting: string;
  capabilities: string;
  howTo: string;
  fallback: string;
  greetingPattern: RegExp;
  capabilitiesPattern: RegExp;
  howToPattern: RegExp;
};

const RESPONSES: Record<Lang, LangResponses> = {
  en: {
    greetingPattern: /\b(hello|hi|hey)\b/i,
    greeting: "Hello! I'm **LOVIX AI** — your conversational creative studio.\n\nI can generate **videos**, **images**, **UGC ads**, **AI influencers**, and **motion effects** just from your words.\n\nWhat would you like to create today?",
    capabilitiesPattern: /what can you (do|make|create|generate)|capabilities|how do you work|help me/i,
    capabilities: "Here's everything I can do:\n\n🎬 **Video** — Cinematic AI videos from text or images\n\n🖼️ **Image** — Photorealistic or artistic visuals\n\n📱 **UGC Ads** — Product video ads with AI influencers\n\n👤 **AI Influencer** — Build & animate a virtual persona\n\n🔄 **Motion** — Lip-sync or motion transfer\n\nJust describe what you want — I'll handle the rest.",
    howToPattern: /how (do i|to|can i)|example|show me/i,
    howTo: "Easy — just describe what you want:\n\n• *\"Create a 9:16 video of ocean waves at sunset\"*\n• *\"Generate a photorealistic image of a luxury car\"*\n• *\"Make a UGC ad for my skincare brand\"*\n\nI'll detect the task and start generating automatically.",
    fallback: "I'm here to help you create amazing AI content.\n\nDescribe a **video**, **image**, or **ad** — I'll detect the task and execute it automatically. ✦",
  },
  it: {
    greetingPattern: /\b(ciao|salve|hey)\b/i,
    greeting: "Ciao! Sono **LOVIX AI** — il tuo studio creativo conversazionale.\n\nPosso generare **video**, **immagini**, **UGC ads**, **AI influencer** ed effetti **motion** partendo dalle tue parole.\n\nCosa vuoi creare oggi?",
    capabilitiesPattern: /cosa (puoi|sai|fai|sei)|come funzion|aiutami|funzionalit/i,
    capabilities: "Ecco tutto quello che posso fare:\n\n🎬 **Video** — Video AI cinematografici da testo o immagini\n\n🖼️ **Immagine** — Visual fotorealistici o artistici\n\n📱 **UGC Ads** — Video pubblicitari con AI influencer\n\n👤 **AI Influencer** — Crea e anima un personaggio virtuale\n\n🔄 **Motion** — Lip-sync o trasferimento di movimento\n\nDescrivi quello che vuoi — penso a tutto io.",
    howToPattern: /come|esempio|mostrami/i,
    howTo: "Semplice — descrivi quello che vuoi:\n\n• *\"Crea un video 9:16 di onde al tramonto\"*\n• *\"Genera un'immagine fotorealistica di un'auto di lusso\"*\n• *\"Crea un UGC ad per il mio brand di skincare\"*\n\nRilevo il task in automatico e inizio a generare.",
    fallback: "Sono qui per aiutarti a creare contenuti AI straordinari.\n\nDescrivi un **video**, un'**immagine** o un **ad** — rilevo il task e lo eseguo automaticamente. ✦",
  },
  es: {
    greetingPattern: /\b(hola|hey|buenas)\b/i,
    greeting: "¡Hola! Soy **LOVIX AI** — tu estudio creativo conversacional.\n\nPuedo generar **videos**, **imágenes**, **UGC ads**, **AI influencers** y efectos de **movimiento** solo con tus palabras.\n\n¿Qué quieres crear hoy?",
    capabilitiesPattern: /qué puedes (hacer|crear|generar)|cómo funciona|ayúdame/i,
    capabilities: "Esto es todo lo que puedo hacer:\n\n🎬 **Video** — Videos AI cinemáticos desde texto o imágenes\n\n🖼️ **Imagen** — Visuales fotorrealistas o artísticos\n\n📱 **UGC Ads** — Anuncios en video con AI influencers\n\n👤 **AI Influencer** — Crea y anima un personaje virtual\n\n🔄 **Motion** — Lip-sync o transferencia de movimiento\n\nDescribe lo que quieres — yo me encargo del resto.",
    howToPattern: /cómo|ejemplo|muéstrame/i,
    howTo: "Fácil — describe lo que quieres:\n\n• *\"Crea un video 9:16 de olas al atardecer\"*\n• *\"Genera una imagen fotorrealista de un auto de lujo\"*\n• *\"Crea un UGC ad para mi marca de skincare\"*\n\nDetecto el task automáticamente y empiezo a generar.",
    fallback: "Estoy aquí para ayudarte a crear contenido AI increíble.\n\nDescribe un **video**, **imagen** o **ad** — detecto el task y lo ejecuto automáticamente. ✦",
  },
  fr: {
    greetingPattern: /\b(bonjour|salut|hey)\b/i,
    greeting: "Bonjour! Je suis **LOVIX AI** — votre studio créatif conversationnel.\n\nJe peux générer des **vidéos**, **images**, **UGC ads**, **AI influencers** et effets de **mouvement** rien qu'avec vos mots.\n\nQue voulez-vous créer aujourd'hui?",
    capabilitiesPattern: /que (peux|pouvez)-vous (faire|créer|générer)|comment fonctionne|aidez-moi/i,
    capabilities: "Voici tout ce que je peux faire:\n\n🎬 **Vidéo** — Vidéos AI cinématographiques depuis du texte ou des images\n\n🖼️ **Image** — Visuels photoréalistes ou artistiques\n\n📱 **UGC Ads** — Publicités vidéo avec AI influencers\n\n👤 **AI Influencer** — Créez et animez un personnage virtuel\n\n🔄 **Motion** — Lip-sync ou transfert de mouvement\n\nDécrivez ce que vous voulez — je m'occupe du reste.",
    howToPattern: /comment|exemple|montrez-moi/i,
    howTo: "Facile — décrivez ce que vous voulez:\n\n• *\"Crée une vidéo 9:16 de vagues au coucher du soleil\"*\n• *\"Génère une image photoréaliste d'une voiture de luxe\"*\n• *\"Crée un UGC ad pour ma marque de skincare\"*\n\nJe détecte le task automatiquement et commence à générer.",
    fallback: "Je suis là pour vous aider à créer du contenu AI incroyable.\n\nDécrivez une **vidéo**, **image** ou **pub** — je détecte le task et l'exécute automatiquement. ✦",
  },
  de: {
    greetingPattern: /\b(hallo|hi|hey)\b/i,
    greeting: "Hallo! Ich bin **LOVIX AI** — dein konversationelles Kreativstudio.\n\nIch kann **Videos**, **Bilder**, **UGC Ads**, **AI Influencer** und **Motion-Effekte** nur aus deinen Worten generieren.\n\nWas möchtest du heute erstellen?",
    capabilitiesPattern: /was kannst du (machen|erstellen|generieren)|wie funktioniert|hilf mir/i,
    capabilities: "Das kann ich alles:\n\n🎬 **Video** — Cinematische KI-Videos aus Text oder Bildern\n\n🖼️ **Bild** — Fotorealistische oder künstlerische Visuals\n\n📱 **UGC Ads** — Video-Werbung mit KI-Influencern\n\n👤 **KI-Influencer** — Erstelle und animiere eine virtuelle Persona\n\n🔄 **Motion** — Lip-Sync oder Bewegungsübertragung\n\nBeschreib was du willst — ich kümmere mich um den Rest.",
    howToPattern: /wie|beispiel|zeig mir/i,
    howTo: "Einfach — beschreib was du willst:\n\n• *\"Erstelle ein 9:16 Video von Wellen bei Sonnenuntergang\"*\n• *\"Generiere ein fotorealistisches Bild eines Luxusautos\"*\n• *\"Erstelle einen UGC Ad für meine Skincare-Marke\"*\n\nIch erkenne den Task automatisch und fange an zu generieren.",
    fallback: "Ich bin hier, um dir beim Erstellen von KI-Inhalten zu helfen.\n\nBeschreib ein **Video**, **Bild** oder eine **Anzeige** — ich erkenne den Task und führe ihn automatisch aus. ✦",
  },
  pt: {
    greetingPattern: /\b(olá|oi|hey)\b/i,
    greeting: "Olá! Sou **LOVIX AI** — o seu estúdio criativo conversacional.\n\nPosso gerar **vídeos**, **imagens**, **UGC ads**, **AI influencers** e efeitos de **movimento** só com suas palavras.\n\nO que você quer criar hoje?",
    capabilitiesPattern: /o que você pode (fazer|criar|gerar)|como funciona|me ajude/i,
    capabilities: "Aqui está tudo que posso fazer:\n\n🎬 **Vídeo** — Vídeos AI cinemáticos a partir de texto ou imagens\n\n🖼️ **Imagem** — Visuais fotorrealistas ou artísticos\n\n📱 **UGC Ads** — Anúncios em vídeo com AI influencers\n\n👤 **AI Influencer** — Crie e anime um personagem virtual\n\n🔄 **Motion** — Lip-sync ou transferência de movimento\n\nDescreva o que você quer — eu cuido do resto.",
    howToPattern: /como|exemplo|me mostre/i,
    howTo: "Fácil — descreva o que você quer:\n\n• *\"Cria um vídeo 9:16 de ondas ao pôr do sol\"*\n• *\"Gera uma imagem fotorrealista de um carro de luxo\"*\n• *\"Cria um UGC ad para minha marca de skincare\"*\n\nDetecto o task automaticamente e começo a gerar.",
    fallback: "Estou aqui para ajudar você a criar conteúdo AI incrível.\n\nDescreva um **vídeo**, **imagem** ou **anúncio** — detecto o task e executo automaticamente. ✦",
  },
};

function getChatResponse(message: string): string {
  const lang = detectLang(message);
  const r = RESPONSES[lang];
  if (r.greetingPattern.test(message)) return r.greeting;
  if (r.capabilitiesPattern.test(message)) return r.capabilities;
  if (r.howToPattern.test(message)) return r.howTo;
  return r.fallback;
}

export function detectIntent(message: string): RouterResult {
  const scores = INTENTS.map(({ id, keywords }) => ({ id, s: score(message, keywords) }));
  const top = scores.sort((a, b) => b.s - a.s)[0];

  if (!top || top.s === 0) {
    return {
      intent: 'chat',
      confidence: 1,
      prompt: message,
      settings: {},
      responseText: getChatResponse(message),
    };
  }

  const intent = top.id;
  let settings: Record<string, unknown> = {};
  if (intent === 'video') settings = extractVideoSettings(message);
  if (intent === 'image') settings = extractImageSettings(message);

  const lang = detectLang(message);

  if (isComplexCreativeRequest(message, intent)) {
    return {
      intent,
      confidence: Math.min(top.s / 2, 1),
      prompt: message,
      settings,
      needsPlan: true,
      plan: buildMarketingPlan(message, intent, settings),
      responseText: lang === 'it'
        ? 'Questa richiesta merita un piano prima di generare. Ti preparo una strategia creativa modificabile.'
        : 'This request deserves a plan before generating. I will prepare an editable creative strategy.',
    };
  }

  // Intents that need info before generating
  if (intent === 'motion') {
    return {
      intent,
      confidence: Math.min(top.s / 2, 1),
      prompt: message,
      settings,
      needsInfo: true,
      agentFields: MOTION_FIELDS,
      responseText: AGENT_INTROS.motion[lang],
    };
  }

  if (intent === 'ugc') {
    return {
      intent,
      confidence: Math.min(top.s / 2, 1),
      prompt: message,
      settings,
      needsInfo: true,
      agentFields: UGC_FIELDS,
      responseText: AGENT_INTROS.ugc[lang],
    };
  }

  if (intent === 'influencer') {
    // No chat generation endpoint — navigate to the full tool
    return {
      intent,
      confidence: Math.min(top.s / 2, 1),
      prompt: message,
      settings,
    };
  }

  return {
    intent,
    confidence: Math.min(top.s / 2, 1),
    prompt: message,
    settings,
  };
}

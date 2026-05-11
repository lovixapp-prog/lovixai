# Lovix.app — Piano di Migrazione Completo
*Stesura: 2026-05-06*

---

## Obiettivo

Migrare Lovix.app da Lovable.dev a stack indipendente:
- **Frontend** → Cloudflare Pages
- **Edge Functions** → Cloudflare Pages Functions (`/functions/api/`)
- **Database & Auth** → Supabase **stesso progetto** (`cedkyduwrjjydmqeerqa`) — nessuna migrazione utenti
- **AI Image/Pose/Prompt** → Google AI Studio API diretta (sostituisce Lovable Gateway)
- **Video / Motion** → Invariati (OpenAI Sora-2 + Kling AI già diretti)
- **Pagamenti** → Stripe invariato

---

## API Key necessarie

Prima di iniziare raccogli queste chiavi:

| Chiave | Dove ottenerla | Già disponibile? |
|--------|---------------|-----------------|
| `GOOGLE_AI_STUDIO_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → API Keys | ❌ DA CREARE |
| `OPENAI_API_KEY` | già in Supabase secrets | ✅ Esiste |
| `KLING_ACCESS_KEY` | già in Supabase secrets | ✅ Esiste |
| `KLING_SECRET_KEY` | già in Supabase secrets | ✅ Esiste |
| `STRIPE_SECRET_KEY` | già in Supabase secrets | ✅ Esiste |
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard Supabase → Settings → API | ✅ Esiste |
| `SUPABASE_ANON_KEY` | Dashboard Supabase → Settings → API | ✅ Esiste (nel .env) |

---

## Struttura finale Cloudflare Pages Functions

```
lovix-app/
├── src/                          # Frontend React (invariato)
├── functions/
│   └── api/
│       ├── generate-video.ts     # ← da Supabase Edge Function
│       ├── check-video-status.ts
│       ├── generate-image.ts     # ← sostituisce Lovable Gateway
│       ├── generate-motion.ts
│       ├── check-motion-status.ts
│       ├── generate-influencer-pose.ts
│       ├── optimize-prompt.ts    # ← sostituisce Lovable Gateway
│       ├── sanitize-prompt.ts    # ← sostituisce Lovable Gateway
│       ├── resize-image-for-video.ts
│       ├── resize-uploaded-image.ts
│       ├── create-checkout.ts
│       ├── check-subscription.ts
│       ├── customer-portal.ts
│       └── tiktok-token-exchange.ts
├── wrangler.toml                 # CF config
├── .env.local                    # dev locale (mai committare)
└── .gitignore                    # aggiornato
```

Frontend chiama `/api/generate-video` → CF Pages Function → servizi AI/Stripe/Supabase.

---

## Cambio URL nel frontend

Attuale: `supabase.functions.invoke('generate-video')`  
Nuovo: `fetch('/api/generate-video', { method: 'POST', ... })`

---

## FASE 0 — Prerequisiti (da fare prima del codice)

### 0a. Crea account/progetto Cloudflare
1. Vai su [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Pages** → Create project → Connect to GitHub → repo `lovix-vision-lab`
3. Build settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
4. **Workers & Pages** → aggiunge automaticamente CF Workers per le `/functions`

### 0b. Ottieni Google AI Studio API Key
1. Vai su [aistudio.google.com](https://aistudio.google.com)
2. API Keys → Create API Key → copia
3. Tienila pronta per lo Step 2

### 0c. Aggiungi dominio lovix.app a Cloudflare
1. Cloudflare → Add Site → lovix.app
2. Copia i nameserver Cloudflare
3. Vai sul registrar del dominio → aggiorna nameserver
4. Attendi propagazione (2-24h)

### 0d. Crea branch di lavoro
```bash
cd ~/Desktop/lovix-app
git checkout -b migration/cloudflare
```

---

## FASE 1 — Fix immediati (30 min)

### 1a. Aggiorna .gitignore

**File:** `.gitignore`

Aggiungi in fondo:
```
# Environment variables — NEVER commit
.env
.env.local
.env.production
```

### 1b. Crea .env.local per sviluppo locale

**File:** `.env.local` (nuovo, mai committare)
```bash
VITE_SUPABASE_URL=https://cedkyduwrjjydmqeerqa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...  # stessa anon key attuale
```

### 1c. Rimuovi lovable-tagger

**File:** `vite.config.ts` — rimuovi righe 4 e 12:
```typescript
// RIMUOVI: import { componentTagger } from "lovable-tagger";
// RIMUOVI: mode === "development" && componentTagger()
```

**File:** `package.json` — rimuovi da devDependencies:
```json
// RIMUOVI: "lovable-tagger": "^1.1.13"
```

```bash
npm install  # aggiorna package-lock.json
```

### 1d. Sostituisci asset hardcoded in index.html

Scarica il logo/favicon attuale e caricalo su Supabase Storage bucket `generations` (folder `public/`) o su Cloudflare R2.

**File:** `index.html` — sostituisci gli URL:
```html
<!-- OG Image e favicon: sostituisci gli URL storage.googleapis.com/gpt-engineer-file-uploads/... -->
<!-- con URL dal tuo storage (Supabase public URL o CF R2) -->
<link rel="icon" type="image/png" href="/favicon.png">
<meta property="og:image" content="https://lovix.app/og-image.png">
<meta name="twitter:image" content="https://lovix.app/og-image.png">
```

Metti `favicon.png` e `og-image.png` nella cartella `public/`.

### 1e. Aggiungi wrangler.toml

**File:** `wrangler.toml` (nuovo nella root):
```toml
name = "lovix-app"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "dist"

[vars]
# Variabili non segrete (override con secrets per prod)
VITE_SUPABASE_URL = "https://cedkyduwrjjydmqeerqa.supabase.co"
```

### 1f. Installa dipendenze per CF Workers

```bash
npm install --save-dev wrangler @cloudflare/workers-types
```

Aggiungi a `tsconfig.json` in `compilerOptions`:
```json
"types": ["@cloudflare/workers-types"]
```

---

## FASE 2 — Porting Edge Functions → CF Pages Functions

### Pattern base CF Pages Function

Ogni funzione Supabase (Deno) diventa un file in `/functions/api/`:

```typescript
// functions/api/[nome-funzione].ts
import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_ANON_KEY: string;
  OPENAI_API_KEY: string;
  GOOGLE_AI_STUDIO_API_KEY: string;
  KLING_ACCESS_KEY: string;
  KLING_SECRET_KEY: string;
  STRIPE_SECRET_KEY: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    // Autenticazione utente
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return Response.json({ error: 'No authorization header' }, { status: 401, headers: corsHeaders });
    }

    const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    // ... logica funzione ...

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ success: false, error: msg }, { status: 400, headers: corsHeaders });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: corsHeaders });
};
```

**Differenze chiave Deno → CF Workers:**

| Deno | CF Workers |
|------|-----------|
| `Deno.env.get('KEY')` | `env.KEY` (dal parametro context) |
| `import from "https://deno.land/..."` | `import from 'npm-package'` |
| `import from "https://esm.sh/..."` | `import from 'npm-package'` |
| `serve(async (req) => { ... })` | `export const onRequestPost = async ({ request, env }) => { ... }` |
| `req.json()` | `request.json()` |

---

### 2a. generate-video.ts

Logica identica all'attuale, solo cambio sintassi runtime.

```typescript
// functions/api/generate-video.ts
import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  OPENAI_API_KEY: string;
}

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { headers: corsHeaders });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  try {
    if (!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const { prompt, seconds, aspectRatio, quality, type = 'video', referenceImageUrl } = await request.json();
    if (!prompt) throw new Error('Prompt is required');

    // Sanitize prompt (chiama la nostra funzione CF)
    let finalPrompt = prompt;
    try {
      const sanitizeRes = await fetch(new URL('/api/sanitize-prompt', request.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (sanitizeRes.ok) {
        const sd = await sanitizeRes.json();
        finalPrompt = sd.sanitizedPrompt || prompt;
      }
    } catch { /* fallback al prompt originale */ }

    // Calcolo crediti
    const durationMult = seconds === 4 ? 1 : seconds === 8 ? 2 : 3;
    const baseCost = 150 * durationMult;
    const creditsRequired = quality === '4k' ? Math.round(baseCost * 1.5) : baseCost;

    // Check crediti
    const { data: profile } = await supabaseAdmin
      .from('profiles').select('credits').eq('id', user.id).single();
    if (!profile || profile.credits < creditsRequired)
      throw new Error(`Insufficient credits. Required: ${creditsRequired}, Available: ${profile?.credits ?? 0}`);

    // Size mapping
    const sizeMap: Record<string, string> = { '1:1': '1280x720', '16:9': '1280x720', '9:16': '720x1280' };
    const size = sizeMap[aspectRatio] || '1280x720';
    const finalSeconds = [4, 8, 12].includes(seconds) ? seconds : 4;

    // Chiama OpenAI Sora-2
    const formData = new FormData();
    formData.append('model', 'sora-2');
    formData.append('prompt', finalPrompt);
    formData.append('size', size);
    formData.append('seconds', String(finalSeconds));

    if (referenceImageUrl?.includes(env.SUPABASE_URL)) {
      const imgRes = await fetch(referenceImageUrl);
      if (imgRes.ok) {
        const blob = await imgRes.blob();
        if (blob.type === 'image/jpeg' && blob.size <= 1_000_000) {
          formData.append('input_reference', new File([blob], 'reference.jpg', { type: 'image/jpeg' }));
        }
      }
    }

    const response = await fetch('https://api.openai.com/v1/videos', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.OPENAI_API_KEY}` },
      body: formData,
    });
    if (!response.ok) throw new Error(`OpenAI error: ${response.status} - ${await response.text()}`);

    const data = await response.json();
    const videoId = data.id;

    // Crea record generazione
    const { data: generation } = await supabaseAdmin
      .from('generations')
      .insert({ user_id: user.id, type, prompt, settings: { seconds: finalSeconds, aspectRatio, quality, size },
                status: 'processing', external_id: videoId, credits_used: creditsRequired })
      .select().single();

    // Scala crediti
    await supabaseAdmin.from('profiles')
      .update({ credits: profile.credits - creditsRequired }).eq('id', user.id);

    return Response.json({ success: true, generationId: generation.id, videoId, creditsUsed: creditsRequired },
      { headers: corsHeaders });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ success: false, error: msg }, { status: 400, headers: corsHeaders });
  }
};
```

---

### 2b. generate-image.ts — SOSTITUISCE Lovable Gateway

**Cambiamento critico:** da `https://ai.gateway.lovable.dev` → Google AI Studio API nativa.

```typescript
// functions/api/generate-image.ts
import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  GOOGLE_AI_STUDIO_API_KEY: string;
}

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

export const onRequestOptions: PagesFunction = async () => new Response(null, { headers: corsHeaders });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!env.GOOGLE_AI_STUDIO_API_KEY) throw new Error('GOOGLE_AI_STUDIO_API_KEY not configured');

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (error || !user) throw new Error('Unauthorized');

    const { prompt, style, imageUrl: sourceImageUrl } = await request.json();
    if (!prompt) throw new Error('Prompt is required');

    const { data: profile } = await supabaseAdmin.from('profiles').select('credits').eq('id', user.id).single();
    const creditsRequired = 50;
    if (!profile || profile.credits < creditsRequired)
      throw new Error(`Insufficient credits. Required: ${creditsRequired}`);

    // Enhancing prompt con stile
    const stylePrompts: Record<string, string> = {
      photorealistic: 'Ultra high resolution, photorealistic, professional photography style',
      artistic: 'Artistic, painterly style with expressive brushstrokes',
      anime: 'Anime style, Japanese animation aesthetic',
      '3d': '3D rendered, high quality CGI, cinematic lighting',
    };
    const enhancedPrompt = style && style !== 'none' ? `${prompt}. ${stylePrompts[style] || ''}` : prompt;

    // Google AI Studio API — formato nativo
    const parts: any[] = [{ text: enhancedPrompt }];
    if (sourceImageUrl) {
      // Image editing: scarica immagine e passa come inlineData
      const imgRes = await fetch(sourceImageUrl);
      if (imgRes.ok) {
        const imgBuffer = await imgRes.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)));
        const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
        parts.push({ inlineData: { mimeType, data: base64 } });
      }
    }

    const googleRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${env.GOOGLE_AI_STUDIO_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
        }),
      }
    );

    if (!googleRes.ok) {
      const err = await googleRes.text();
      if (googleRes.status === 429) throw new Error('Rate limit exceeded. Try again later.');
      throw new Error(`Image generation failed: ${googleRes.status} - ${err}`);
    }

    const googleData = await googleRes.json();

    // Estrai immagine base64 dalla risposta Google
    const imagePart = googleData.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    if (!imagePart?.inlineData?.data) {
      const textPart = googleData.candidates?.[0]?.content?.parts?.find((p: any) => p.text);
      throw new Error(textPart?.text ? `Generation refused: ${textPart.text.substring(0, 150)}` : 'No image generated');
    }

    const imageType = imagePart.inlineData.mimeType?.split('/')[1] || 'png';
    const base64Data = imagePart.inlineData.data;
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload su Supabase Storage
    const filename = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${imageType}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('generations')
      .upload(filename, imageBytes, { contentType: `image/${imageType}`, upsert: false });
    if (uploadError) throw new Error('Failed to save image');

    const { data: urlData } = supabaseAdmin.storage.from('generations').getPublicUrl(filename);
    const resultImageUrl = urlData.publicUrl;

    // Salva record + scala crediti
    const { data: generation } = await supabaseAdmin
      .from('generations')
      .insert({ user_id: user.id, type: 'image', prompt, settings: { style }, status: 'completed', result_url: resultImageUrl, credits_used: creditsRequired })
      .select().single();

    await supabaseAdmin.from('profiles').update({ credits: profile.credits - creditsRequired }).eq('id', user.id);

    return Response.json({ success: true, imageUrl: resultImageUrl, generationId: generation?.id, creditsUsed: creditsRequired }, { headers: corsHeaders });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ success: false, error: msg }, { status: 400, headers: corsHeaders });
  }
};
```

---

### 2c. sanitize-prompt.ts — SOSTITUISCE Lovable Gateway

```typescript
// functions/api/sanitize-prompt.ts
interface Env { GOOGLE_AI_STUDIO_API_KEY: string; }

const SYSTEM_PROMPT = `You are a content compliance assistant...`; // stesso system prompt attuale

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

export const onRequestOptions: PagesFunction = async () => new Response(null, { headers: corsHeaders });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { prompt } = await request.json();
    if (!prompt || !env.GOOGLE_AI_STUDIO_API_KEY) {
      return Response.json({ sanitizedPrompt: prompt || '', wasModified: false }, { headers: corsHeaders });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GOOGLE_AI_STUDIO_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1000 },
        }),
      }
    );

    if (!res.ok) return Response.json({ sanitizedPrompt: prompt, wasModified: false }, { headers: corsHeaders });

    const data = await res.json();
    const sanitizedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || prompt;
    const wasModified = sanitizedPrompt.toLowerCase() !== prompt.toLowerCase();

    return Response.json({ sanitizedPrompt, wasModified }, { headers: corsHeaders });
  } catch {
    return Response.json({ sanitizedPrompt: '', wasModified: false }, { status: 500, headers: corsHeaders });
  }
};
```

---

### 2d. optimize-prompt.ts — SOSTITUISCE Lovable Gateway

```typescript
// functions/api/optimize-prompt.ts
// Stessa logica, API Google nativa invece di Lovable Gateway
// Per multimodal (referenceImage): usa parts con inlineData
// Per text-only: usa gemini-2.0-flash
// Modello per immagini: gemini-2.5-flash-preview-05-20 o gemini-2.0-flash
```

*(Pattern identico a sanitize-prompt, aggiunge system prompt per video/image optimization)*

---

### 2e. generate-influencer-pose.ts — SOSTITUISCE Lovable Gateway

```typescript
// functions/api/generate-influencer-pose.ts
// Logica identica a generate-image ma:
// - Scarica immagine di riferimento dell'influencer
// - La passa come inlineData a Gemini
// - Salva su influencer_poses invece di generations
// - 0 crediti prima posa, 30 successive
```

---

### 2f. generate-motion.ts, check-motion-status.ts

**Nessun cambio di logica** — solo porting sintassi Deno → CF Workers.  
Kling AI già chiamato direttamente.

---

### 2g. check-video-status.ts

**Nessun cambio di logica** — solo porting sintassi.  
OpenAI già chiamato direttamente.

---

### 2h. create-checkout.ts, check-subscription.ts, customer-portal.ts

**Nessun cambio di logica** — solo porting sintassi + replace `import from "https://esm.sh/stripe@18.5.0"` con `import Stripe from 'stripe'`.

```bash
npm install stripe
```

---

### 2i. tiktok-token-exchange.ts, resize-image-for-video.ts, resize-uploaded-image.ts

**Nessun cambio di logica** — solo porting sintassi.

---

## FASE 3 — Aggiorna chiamate API nel Frontend

Tutte le chiamate `supabase.functions.invoke('nome-funzione')` vanno sostituite con `fetch('/api/nome-funzione', ...)`.

### Mappatura chiamate da cercare nel codice

```bash
grep -r "supabase.functions.invoke" src/ --include="*.ts" --include="*.tsx"
```

**Pattern di sostituzione:**

```typescript
// PRIMA (Supabase):
const { data, error } = await supabase.functions.invoke('generate-video', {
  body: { prompt, seconds, aspectRatio }
});

// DOPO (CF Pages Function):
const session = await supabase.auth.getSession();
const res = await fetch('/api/generate-video', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.data.session?.access_token}`,
  },
  body: JSON.stringify({ prompt, seconds, aspectRatio }),
});
const data = await res.json();
const error = res.ok ? null : data.error;
```

Crea un helper per non ripetere il pattern ovunque:

```typescript
// src/lib/api.ts
import { supabase } from '@/integrations/supabase/client';

export async function callAPI(path: string, body: object) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return res.json();
}
```

---

## FASE 4 — Secrets su Cloudflare

Dopo il deploy su CF Pages, aggiungi i secrets:

```bash
# Via Cloudflare Dashboard:
# Pages → lovix-app → Settings → Environment variables → Production

# Oppure via wrangler CLI:
npx wrangler pages secret put SUPABASE_URL --project-name lovix-app
npx wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY --project-name lovix-app
npx wrangler pages secret put SUPABASE_ANON_KEY --project-name lovix-app
npx wrangler pages secret put OPENAI_API_KEY --project-name lovix-app
npx wrangler pages secret put GOOGLE_AI_STUDIO_API_KEY --project-name lovix-app
npx wrangler pages secret put KLING_ACCESS_KEY --project-name lovix-app
npx wrangler pages secret put KLING_SECRET_KEY --project-name lovix-app
npx wrangler pages secret put STRIPE_SECRET_KEY --project-name lovix-app
```

**Variabili VITE_ (non segrete, build-time):**

Nel CF Pages → Settings → Environment variables → Production:
```
VITE_SUPABASE_URL = https://cedkyduwrjjydmqeerqa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGci...  (anon key)
```

---

## FASE 5 — Aggiorna Supabase Auth

Il progetto Supabase attuale ha `site_url = "http://127.0.0.1:3000"` nel config locale.  
Va aggiornato nella dashboard Supabase per puntare al dominio finale:

1. Supabase Dashboard → Authentication → URL Configuration
2. **Site URL:** `https://lovix.app`
3. **Redirect URLs:** aggiungi `https://lovix.app/**`
4. (Opzionale) rimuovi il vecchio URL Lovable: `https://cedkyduwrjjydmqeerqa.supabase.co`

---

## FASE 6 — Deploy e Test

### 6a. Build locale
```bash
npm run build
```
Verifica che `dist/` sia generata senza errori.

### 6b. Test locale con Wrangler
```bash
npx wrangler pages dev dist --port 8080
```
Testa ogni flusso:
- [ ] Signup / Login
- [ ] Generazione video (Sora-2)
- [ ] Generazione immagine (Gemini)
- [ ] Motion control (Kling)
- [ ] Creazione influencer + pose
- [ ] Checkout Stripe
- [ ] Dashboard crediti

### 6c. Deploy su CF Pages
```bash
git add -A
git commit -m "migrate: port to Cloudflare Pages + CF Workers functions"
git push origin migration/cloudflare
```
CF Pages fa deploy automatico dal push. Verifica su `lovix-app.pages.dev`.

### 6d. Aggiungi dominio custom
CF Pages → Custom domains → Add → `lovix.app`  
Se il dominio è già su Cloudflare, DNS configurato automaticamente.

---

## FASE 7 — Dismetti Lovable

Solo DOPO aver verificato che tutto funzioni su CF Pages:

1. Disconnetti il repo da Lovable.dev
2. Rimuovi `LOVABLE_API_KEY` dai secrets Supabase (non più necessaria)
3. Aggiorna README con nuovo stack

---

## Ordine di esecuzione raccomandato

```
GIORNO 1:
  [x] Fase 0  — Setup CF account + dominio + Google AI key
  [x] Fase 1  — Fix gitignore, rimuovi lovable-tagger, sostituisci asset

GIORNO 2-3:
  [x] Fase 2  — Port 13 funzioni su CF Workers (2-3h lavoro)
  [x] Fase 3  — Aggiorna chiamate API nel frontend

GIORNO 4:
  [x] Fase 4  — Configura secrets CF
  [x] Fase 5  — Aggiorna Supabase Auth URLs
  [x] Fase 6a/6b — Build + test locale

GIORNO 5:
  [x] Fase 6c/6d — Deploy CF Pages + dominio custom
  [x] Test end-to-end su prod
  [x] Fase 7  — Dismetti Lovable
```

---

## Riepilogo file da modificare/creare

| File | Azione |
|------|--------|
| `.gitignore` | Aggiungi `.env`, `.env.local` |
| `.env` | **ELIMINARE** dal repo (dopo backup locale) |
| `.env.local` | **CREARE** (mai committare) |
| `vite.config.ts` | Rimuovi lovable-tagger |
| `package.json` | Rimuovi lovable-tagger, aggiungi stripe, wrangler |
| `index.html` | Sostituisci URL asset Lovable/GPT-Engineer |
| `wrangler.toml` | **CREARE** |
| `tsconfig.json` | Aggiungi @cloudflare/workers-types |
| `src/lib/api.ts` | **CREARE** helper callAPI |
| `src/**/*.tsx` | Sostituisci `supabase.functions.invoke` → `callAPI` |
| `functions/api/*.ts` | **CREARE** 13 CF Pages Functions |
| `supabase/functions/` | Mantenere fino a verifica (poi deprecare) |

---

## Domande risolte

| Domanda | Risposta |
|---------|---------|
| Stesso Supabase? | ✅ Sì — nessuna migrazione utenti necessaria |
| Utenti esistenti? | ✅ Preservati — stesso DB, stesse credenziali |
| Google AI Studio API | ❌ Da creare su aistudio.google.com |
| Kling / Stripe / OpenAI | ✅ Chiavi già in Supabase secrets, da copiare in CF secrets |
| Supabase Edge Functions | Mantenere attive fino a CF Workers verificati, poi deprecare |

---

*Fine piano — pronto per implementazione dopo approvazione*

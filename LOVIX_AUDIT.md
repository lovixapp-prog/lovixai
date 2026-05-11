# Lovix.app — Migration Audit Report
*Generated: 2026-05-06*

---

## 1. App Overview

**Lovix.app** is a credit-based AI creative SaaS platform for content creators. Users generate:
- **AI Videos** via OpenAI Sora-2 (text-to-video, 4/8/12s, 720p or 4K)
- **AI Images** via Google Gemini 2.5 Flash (text-to-image and image editing)
- **Motion Control** via Kling AI (image-to-video, motion transfer, lip-sync)
- **AI Influencers** — create virtual influencer personas, generate consistent photo poses, animate them with motion/lipsync

Key user flows:
1. Register → receive 100 free credits → buy more via Stripe subscription
2. Enter prompt → generate video/image/motion → result saved to Supabase Storage → shown in "My Creations" dashboard
3. Create an AI influencer → upload avatar → generate new poses → animate → publish (TikTok OAuth integration)

Monetization: Stripe subscriptions (Standard / Pro / Premier / Ultra) + credit packs (one-time payment).

---

## 2. Stack Attuale

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 18.3 + Vite 5.4 + TypeScript 5.8 + Tailwind CSS 3.4 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Routing | React Router v6.30 |
| State/Fetching | TanStack React Query v5.83 |
| Auth & Database | Supabase (`@supabase/supabase-js` ^2.89) |
| Payments | Stripe (via Supabase Edge Function) |
| AI — Video | OpenAI Sora-2 (`https://api.openai.com/v1/videos`) |
| AI — Image | Google Gemini 2.5 Flash (via Lovable AI Gateway) |
| AI — Motion/LipSync | Kling AI (`https://api.klingai.com/v1/videos/`) |
| AI — Prompt Optimization | Google Gemini 2.5 Flash / 3 Flash (via Lovable AI Gateway) |
| AI — Prompt Sanitization | Google Gemini 2.5 Flash (via Lovable AI Gateway) |
| Storage | Supabase Storage (bucket: `generations`, `video-references`) |
| Edge Functions | Supabase Edge Functions (Deno runtime) — 13 functions |
| Analytics | TikTok Pixel (ID: `D5JPOT3C77U894MDATFG`) |
| Social | TikTok OAuth (content posting) |
| Build | Vite (`npm run build`) |
| Hosting | Lovable.dev (current) |
| CI/CD | None found |

---

## 3. Dipendenze Lovable da Rimuovere

### 3a. Package NPM
| Package | Dove | Tipo |
|---------|------|------|
| `lovable-tagger@^1.1.13` | `package.json` devDependencies | Da rimuovere |
| `lovable-tagger` import | `vite.config.ts` line 4 + 12 | Da rimuovere |

### 3b. Lovable AI Gateway (CRITICO)
**URL:** `https://ai.gateway.lovable.dev/v1/chat/completions`  
**Auth:** `LOVABLE_API_KEY` env var nelle Supabase Edge Functions

Funzioni che usano il gateway:
| Funzione | Modello | Scopo |
|----------|---------|-------|
| `generate-image/index.ts` | `google/gemini-2.5-flash-image-preview` | Generazione immagini |
| `generate-influencer-pose/index.ts` | `google/gemini-2.5-flash-image-preview` | Pose influencer |
| `optimize-prompt/index.ts` | `google/gemini-2.5-flash` + `google/gemini-3-flash-preview` | Ottimizzazione prompt |
| `sanitize-prompt/index.ts` | `google/gemini-2.5-flash` | Moderazione contenuti |

⚠️ **Queste 4 funzioni smettono di funzionare appena il LOVABLE_API_KEY viene revocato.**

### 3c. Asset su Lovable/GPT Engineer Cloud Storage
Hardcoded in `index.html`:
```
https://storage.googleapis.com/gpt-engineer-file-uploads/SN5nSGv7V5ORimvtuGYSziuzHWl2/...
```
Usato per: OG image, Twitter card image, favicon.  
⚠️ Questi file saranno eliminati quando l'account Lovable viene chiuso.

### 3d. README.md
Contiene boilerplate Lovable con `REPLACE_WITH_PROJECT_ID` — da sostituire.

---

## 4. Utilizzo Modello AI — Inventario Completo

### Video Generation (`generate-video`)
- **Modello:** `sora-2`
- **API:** `POST https://api.openai.com/v1/videos` (multipart/form-data)
- **Input:** prompt (text), size (`1280x720` o `720x1280`), seconds (4/8/12), optional reference image
- **Output:** job ID asincrono
- **Polling:** `GET https://api.openai.com/v1/videos/{id}` via `check-video-status`
- **Download:** `GET https://api.openai.com/v1/videos/{id}/content` → upload su Supabase Storage
- **Costo crediti:** 150 (4s) / 300 (8s) / 450 (12s), +50% per 4K
- **API Key:** `OPENAI_API_KEY`

### Image Generation (`generate-image`)
- **Modello:** `google/gemini-2.5-flash-image-preview` (via Lovable Gateway)
- **API:** `POST https://ai.gateway.lovable.dev/v1/chat/completions`
- **Input:** prompt (text), optional style, optional source image URL
- **Output:** base64 image → upload su Supabase Storage
- **Costo crediti:** 50
- **API Key:** `LOVABLE_API_KEY` ← **DA SOSTITUIRE**

### Motion Control / Lip-Sync / Image-to-Video (`generate-motion`)
- **Provider:** Kling AI
- **API Endpoints:**
  - Lip-sync: `POST https://api.klingai.com/v1/videos/lip-sync`
  - Motion transfer: `POST https://api.klingai.com/v1/videos/motion-control`
  - Image-to-video: `POST https://api.klingai.com/v1/videos/image2video`
- **Auth:** JWT generato da `KLING_ACCESS_KEY` + `KLING_SECRET_KEY` (HMAC-SHA256)
- **Input:** videoUrl + imageUrl (motion), videoUrl + audioUrl (lipsync), imageUrl solo (i2v)
- **Output:** task_id asincrono, polled via `check-motion-status`
- **Costo crediti:** 150 (standard) / 200 (pro)

### Influencer Pose Generation (`generate-influencer-pose`)
- **Modello:** `google/gemini-2.5-flash-image-preview` (via Lovable Gateway)
- **Input:** influencer reference image + prompt
- **Output:** nuova immagine base64 → Supabase Storage
- **Costo crediti:** 0 (prima pose) / 30 (successive)
- **API Key:** `LOVABLE_API_KEY` ← **DA SOSTITUIRE**

### Prompt Optimization (`optimize-prompt`)
- **Modello:** `google/gemini-2.5-flash` (multimodal con immagine) o `google/gemini-3-flash-preview` (testo)
- **Input:** prompt + type (image/video) + optional reference image
- **Output:** prompt ottimizzato
- **API Key:** `LOVABLE_API_KEY` ← **DA SOSTITUIRE**
- ⚠️ `google/gemini-3-flash-preview` non è un modello standard — probabilmente è un alias del gateway Lovable

### Prompt Sanitization (`sanitize-prompt`)
- **Modello:** `google/gemini-2.5-flash` (via Lovable Gateway)
- **Input:** prompt raw
- **Output:** prompt sanitizzato (content policy enforcement)
- **API Key:** `LOVABLE_API_KEY` ← **DA SOSTITUIRE**

---

## 5. Variabili d'Ambiente

### Frontend (VITE_ prefix, client-side)
| Variabile | Valore attuale nel .env | Scopo |
|-----------|------------------------|-------|
| `VITE_SUPABASE_URL` | `https://cedkyduwrjjydmqeerqa.supabase.co` | Supabase endpoint |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGci...` (anon key) | Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | `cedkyduwrjjydmqeerqa` | Project ID (non usato nel codice) |

### Edge Functions (Supabase Secrets, server-side)
| Variabile | Servizio | Criticità |
|-----------|---------|-----------|
| `SUPABASE_URL` | Supabase | Auto-iniettato da Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Auto-iniettato da Supabase |
| `SUPABASE_ANON_KEY` | Supabase | Usato in check-subscription |
| `OPENAI_API_KEY` | OpenAI | Video gen (Sora-2) + video status |
| `LOVABLE_API_KEY` | Lovable AI Gateway | Image gen, pose, prompt opt/sanitize ← DA SOSTITUIRE |
| `KLING_ACCESS_KEY` | Kling AI | Motion / lip-sync |
| `KLING_SECRET_KEY` | Kling AI | Motion / lip-sync |
| `STRIPE_SECRET_KEY` | Stripe | Checkout + subscription check |

---

## 6. Supabase — Inventario Completo

**Project ID:** `cedkyduwrjjydmqeerqa`  
**URL:** `https://cedkyduwrjjydmqeerqa.supabase.co`

### Tabelle
| Tabella | Scopo |
|---------|-------|
| `profiles` | Utenti (credits, referral_code, referred_by) |
| `generations` | Storico generazioni (video, immagini, motion) |
| `assets` | Asset caricati dagli utenti |
| `influencers` | AI Influencer creati dall'utente |
| `influencer_poses` | Pose generate per ogni influencer |
| `referrals` | Programma referral (signup + subscription credits) |

### RLS (Row Level Security)
Abilitato su `profiles` con policy per SELECT/INSERT/UPDATE solo per `auth.uid() = id`.  
Altre tabelle: da verificare nelle migration intermedie.

### Storage Buckets
| Bucket | Visibilità | Contenuto |
|--------|-----------|-----------|
| `generations` | Public | Immagini e video generati |
| `video-references` | Private | Immagini di riferimento per Sora |

### Auth
- Email + password (confirm email: **DISABILITATO**)
- Nessun OAuth social configurato nelle migration (TikTok gestito separatamente via OAuth token exchange)
- Trigger `on_auth_user_created` → crea `profiles` automaticamente

### Edge Functions (13 totali)
| Funzione | JWT verify | Scopo |
|----------|-----------|-------|
| `generate-video` | false (manual) | Sora-2 video gen |
| `check-video-status` | false (manual) | Polling + download video |
| `generate-image` | false (manual) | Gemini image gen |
| `generate-motion` | false (manual) | Kling motion/lipsync/i2v |
| `check-motion-status` | false (manual) | Polling Kling |
| `generate-influencer-pose` | false (manual) | Gemini pose gen |
| `optimize-prompt` | false (manual) | Gemini prompt enhancement |
| `sanitize-prompt` | false (manual) | Gemini content moderation |
| `resize-image-for-video` | false (manual) | Ridimensiona immagini per Sora |
| `resize-uploaded-image` | false (manual) | Ridimensiona upload utente |
| `create-checkout` | false (manual) | Stripe checkout session |
| `check-subscription` | false (manual) | Stato sub Stripe |
| `customer-portal` | false (manual) | Stripe customer portal |
| `tiktok-token-exchange` | false (manual) | OAuth TikTok |

---

## 7. Problemi Critici

### 🔴 CRITICO 1 — `.env` committato nel repo
Il file `.env` con `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key) è nel repo pubblico.  
La anon key è progettata per essere pubblica, ma idealmente non deve stare in un repo pubblico.  
**Fix immediato:** aggiungere `.env` e `.env.local` al `.gitignore`.  
Il `.env.local` per lo sviluppo locale va ricreato manualmente.

### 🔴 CRITICO 2 — Dipendenza da Lovable AI Gateway (4 funzioni bloccanti)
Quando il `LOVABLE_API_KEY` viene revocato (alla chiusura dell'account Lovable), queste funzioni smettono completamente di funzionare:
- `generate-image` → nessuna immagine generabile
- `generate-influencer-pose` → nessuna posa influencer
- `optimize-prompt` → prompt optimization rotta
- `sanitize-prompt` → sanitizzazione disabilitata (fallback al prompt originale)

### 🔴 CRITICO 3 — OG image e favicon su storage GPT Engineer (Lovable)
Questi URL vengono eliminati alla chiusura account:
```
https://storage.googleapis.com/gpt-engineer-file-uploads/SN5nSGv7V5ORimvtuGYSziuzHWl2/...
```
Impatta: social preview card su ogni condivisione su Twitter/LinkedIn/WhatsApp, favicon del sito.

### 🟡 MEDIO 4 — `lovable-tagger` in vite.config.ts
Presente solo in dev mode (`mode === "development"`). Non impatta la build di produzione.  
Ma è una dipendenza inutile e va rimossa.

### 🟡 MEDIO 5 — `verify_jwt = false` su tutte le Edge Functions
JWT validation è implementata manualmente nel codice di ogni funzione.  
Non è un bug (il codice lo fa correttamente), ma aumenta la superficie di attacco.  
In Cloudflare Workers il JWT va validato allo stesso modo.

### 🟡 MEDIO 6 — Model name `google/gemini-3-flash-preview`
In `optimize-prompt/index.ts` viene usato `google/gemini-3-flash-preview` per le chiamate text-only.  
Questo non è un modello standard di Google — è un alias specifico del gateway Lovable.  
Al momento della migrazione va sostituito con il modello corretto (es. `gemini-2.5-flash` o `gemini-2.0-flash`).

### 🟡 MEDIO 7 — Credit deduction non atomica
In `generate-video` e `generate-image`, i crediti vengono scalati DOPO che la job è stata inviata all'AI.  
Se il DB update fallisce, l'utente ottiene la generazione gratis.  
Basso rischio ora, da fixare con transazione atomica in futuro.

### 🟢 BASSO 8 — `supabase/config.toml` espone il project_id
`project_id = "cedkyduwrjjydmqeerqa"` è in chiaro nel repo.  
Questo non è un segreto (è nel URL pubblico), ma va aggiornato se si crea un nuovo progetto Supabase.

---

## 8. Stima Complessità Migrazione

| Area | Complessità | Note |
|------|------------|------|
| Deploy su Cloudflare Pages | 🟢 Bassa | Solo build Vite + deploy |
| Rimozione lovable-tagger | 🟢 Bassa | 2 righe in vite.config.ts + package.json |
| Fix .env + .gitignore | 🟢 Bassa | 1 file da modificare |
| Sostituzione OG image/favicon | 🟢 Bassa | Upload nuovi asset su storage proprio |
| Migrazione Supabase → nuovo progetto | 🟡 Media | Schema (13 migration), data export/import, nuove env vars |
| Sostituzione Lovable AI Gateway | 🟡 Media | 4 funzioni da riscrivere con API dirette Google/Anthropic |
| Migrazione Edge Functions → CF Workers | 🟡 Media | Deno → Workers, stessa logica, API diverse |
| OpenAI Sora-2 | 🟢 Bassa | Già usa OpenAI direttamente, nessun cambio |
| Kling AI motion | 🟢 Bassa | Già usa Kling direttamente, nessun cambio |
| Stripe | 🟢 Bassa | Config identica, solo nuove env vars |
| TikTok OAuth | 🟢 Bassa | Funzione standalone, nessuna dipendenza Lovable |

---

## 9. Stack Target Proposto

| Layer | Tecnologia attuale | Target |
|-------|-------------------|--------|
| Frontend | React + Vite + TS + Tailwind | **Invariato** (solo rimuovi lovable-tagger) |
| UI Components | shadcn/ui | **Invariato** |
| Routing | React Router v6 | **Invariato** |
| Auth & Database | Supabase (cedkyduwrjjydmqeerqa) | **Nuovo progetto Supabase** (migra schema + data) |
| Storage | Supabase Storage | **Invariato** (nel nuovo progetto) |
| Edge Functions | Supabase Edge Functions (Deno) | **Cloudflare Workers** (`/functions` directory) |
| Hosting | Lovable.dev | **Cloudflare Pages** |
| AI Video | OpenAI Sora-2 | **Invariato** (già diretto) |
| AI Image | Lovable Gateway → Gemini | **Google AI Studio API diretta** (`generativelanguage.googleapis.com`) |
| AI Influencer Pose | Lovable Gateway → Gemini | **Google AI Studio API diretta** (stesso modello) |
| AI Prompt Opt. | Lovable Gateway → Gemini | **Claude API** (`claude-haiku-4-5`) o Gemini diretta |
| AI Sanitization | Lovable Gateway → Gemini | **Claude API** o Gemini diretta |
| Motion / Lip-sync | Kling AI | **Invariato** (già diretto) |
| Payments | Stripe | **Invariato** |
| Domain | Lovable subdomain | **lovix.app** (Cloudflare DNS) |

### Alternativa AI per image generation post-migrazione
**Raccomandato:** Google AI Studio API diretta con `gemini-2.0-flash-exp-image-generation`  
- Stesso modello, stesso formato risposta, solo cambia URL e API key
- Nessuna riscrittura della logica di business
- Costo Google AI Studio vs Lovable Gateway da verificare

**Alternativa:** OpenAI `gpt-image-1`  
- API diversa, output differente (URL diretto, non base64)  
- Richiede riscrittura parziale delle funzioni

---

## 10. Branch di Migrazione

Creare branch: `migration/cloudflare`  
Non committare mai: `.env`, `.env.local`, chiavi API

---

*Fine report — generato da audit completo del codebase il 2026-05-06*

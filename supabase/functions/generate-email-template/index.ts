import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Section content types ──────────────────────────────────────────
type HeroContent = { headline: string; subheadline: string; ctaText: string; ctaUrl: string };
type WelcomeContent = { greeting: string; body: string };
type FeaturesContent = { title?: string; items: Array<{ emoji: string; title: string; desc: string }> };
type HighlightContent = { badge?: string; headline: string; body: string; ctaText: string; ctaUrl: string };
type PromoContent = { headline: string; body: string; code?: string; expiryText?: string; ctaText: string; ctaUrl: string };
type StatsContent = { items: Array<{ value: string; label: string }> };
type CtaContent = { headline: string; body?: string; ctaText: string; ctaUrl: string };
type CreditsContent = { creditsAmount: string; message: string };
type DividerContent = Record<string, never>;

type SectionContent = HeroContent | WelcomeContent | FeaturesContent | HighlightContent |
  PromoContent | StatsContent | CtaContent | CreditsContent | DividerContent;

type SectionType = 'hero' | 'welcome' | 'features' | 'highlight' | 'promo' | 'stats' | 'cta' | 'credits' | 'divider';

interface EmailSection { type: SectionType; content: SectionContent }

const SECTION_SCHEMAS: Record<SectionType, string> = {
  hero: `{
    "headline": "punchy H1 max 8 words (can use <br>)",
    "subheadline": "1-2 sentences expanding on headline",
    "ctaText": "strong verb phrase 3-5 words",
    "ctaUrl": "https://lovix.app/dashboard"
  }`,
  welcome: `{
    "greeting": "warm greeting line",
    "body": "2-3 sentence warm intro paragraph"
  }`,
  features: `{
    "title": "optional section title",
    "items": [
      {"emoji": "🎨", "title": "Feature name", "desc": "one sentence benefit"},
      {"emoji": "🎬", "title": "Feature name", "desc": "one sentence benefit"},
      {"emoji": "✨", "title": "Feature name", "desc": "one sentence benefit"}
    ]
  }`,
  highlight: `{
    "badge": "optional short label e.g. NEW or PRO",
    "headline": "5-7 word headline",
    "body": "2-3 sentences describing the feature/benefit",
    "ctaText": "3-5 word CTA",
    "ctaUrl": "https://lovix.app/dashboard"
  }`,
  promo: `{
    "headline": "exciting promo headline 5-8 words",
    "body": "1-2 sentences describing the offer",
    "code": "optional promo code in UPPERCASE",
    "expiryText": "optional expiry e.g. Offer ends Sunday",
    "ctaText": "3-5 word action CTA",
    "ctaUrl": "https://lovix.app/dashboard"
  }`,
  stats: `{
    "items": [
      {"value": "50K+", "label": "Creators"},
      {"value": "2M+", "label": "Generations"},
      {"value": "4.9★", "label": "Rating"}
    ]
  }`,
  cta: `{
    "headline": "compelling CTA headline 5-7 words",
    "body": "optional 1 sentence supporting text",
    "ctaText": "strong verb phrase 3-5 words",
    "ctaUrl": "https://lovix.app/dashboard"
  }`,
  credits: `{
    "creditsAmount": "150",
    "message": "1-2 sentences about the free credits and what they can do"
  }`,
  divider: `{}`,
};

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  newsletter: 'Monthly newsletter with platform updates, new AI features, tips for creators',
  promo: 'Promotional campaign with special discount or bonus credits — urgency and excitement',
  reactivation: 'Re-engagement email for users inactive 30+ days — remind of LOVIX value, show new features',
  feature: 'Feature announcement — showcase a new capability with excitement and clear benefits',
  custom: 'Custom campaign based on provided context',
};

const BRAND_CONTEXT = `LOVIX is a premium AI creative platform:
- AI Image Generation powered by GPT-image-1
- AI Video Generation with Kling v2.6 (cinematic quality)
- AI Influencer Creator (custom AI personas with custom poses)
- Motion Transfer & Lip-Sync (animate images, make them talk)
- 150 free credits on signup. Plans: Standard 660cr $8.99/mo, Pro 3000cr $31.99/mo

Brand voice: bold, inspiring, premium, creator-focused. Never generic. Always specific and energizing.
Colors: violet (#7c3aed), orange (#f97316), cyan (#06b6d4) — aurora aesthetic.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Admin auth check
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    let jwtRole = '';
    try { jwtRole = JSON.parse(atob(token.split('.')[1])).role ?? ''; } catch { /* */ }
    if (jwtRole !== 'service_role') {
      return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) throw new Error('OPENAI_API_KEY not configured');

    const body = await req.json();
    const action: string = body.action ?? 'generate_full';

    // ── ACTION: generate_section ─────────────────────────────────
    if (action === 'generate_section') {
      const { sectionType, context = '', currentContent = {} } = body as {
        sectionType: SectionType;
        context: string;
        currentContent: Record<string, unknown>;
      };
      if (!sectionType || !SECTION_SCHEMAS[sectionType]) throw new Error(`Unknown section type: ${sectionType}`);

      const systemPrompt = `You are a world-class email copywriter for LOVIX.

${BRAND_CONTEXT}

Output ONLY valid JSON matching this exact schema for a "${sectionType}" section:
${SECTION_SCHEMAS[sectionType]}

Make the content fresh, specific, and high-converting. Never generic.`;

      const userPrompt = `Generate content for a "${sectionType}" email section.
${context ? `Instructions: ${context}` : 'Make it engaging and on-brand for LOVIX.'}
${Object.keys(currentContent).length > 0 ? `Current content to improve: ${JSON.stringify(currentContent)}` : ''}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
          response_format: { type: 'json_object' },
          temperature: 0.9,
        }),
      });
      if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
      const data = await response.json();
      const content = JSON.parse(data.choices?.[0]?.message?.content?.trim() ?? '{}');

      return new Response(JSON.stringify({ success: true, content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── ACTION: generate_full ────────────────────────────────────
    const { templateType = 'newsletter', context = '', sections: requestedSections } = body as {
      templateType: string;
      context: string;
      sections?: SectionType[];
    };

    const defaultSectionsByType: Record<string, SectionType[]> = {
      newsletter: ['hero', 'welcome', 'features', 'cta'],
      promo: ['hero', 'promo', 'features', 'cta'],
      reactivation: ['hero', 'welcome', 'highlight', 'promo', 'cta'],
      feature: ['hero', 'highlight', 'features', 'cta'],
      custom: ['hero', 'welcome', 'features', 'cta'],
    };

    const sectionsToGenerate: SectionType[] = requestedSections ?? defaultSectionsByType[templateType] ?? ['hero', 'features', 'cta'];

    // Build schema for all requested sections at once
    const sectionsSchema = sectionsToGenerate.map(s => `"${s}": ${SECTION_SCHEMAS[s]}`).join(',\n  ');

    const systemPrompt = `You are a world-class email copywriter for LOVIX.

${BRAND_CONTEXT}

Output ONLY valid JSON with this exact structure — no markdown, no extra text:
{
  "subject": "compelling subject line max 52 chars",
  "previewText": "inbox snippet max 90 chars — intriguing, create curiosity",
  "sections": {
    ${sectionsSchema}
  }
}

Rules:
- Content must be fresh, specific, NOT generic marketing fluff
- Each section must feel cohesive — same campaign story
- Divider sections: just return empty object {}
- CTA URLs always https://lovix.app/dashboard unless context says otherwise`;

    const typeDescription = TEMPLATE_DESCRIPTIONS[templateType] ?? TEMPLATE_DESCRIPTIONS.custom;
    const userPrompt = `Campaign type: ${templateType} — ${typeDescription}
${context ? `Sender context: ${context}` : ''}
Sections needed: ${sectionsToGenerate.join(', ')}

Write a high-converting email campaign. Make every word count. CTA must be urgent and action-oriented.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.88,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI error: ${response.status} — ${err.substring(0, 200)}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) throw new Error('No content from AI');

    let parsed: { subject: string; previewText: string; sections: Record<string, SectionContent> };
    try { parsed = JSON.parse(raw); } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Could not parse AI response');
      parsed = JSON.parse(match[0]);
    }

    if (!parsed.subject) throw new Error('Incomplete response from AI');

    // Assemble sections array
    const sections: EmailSection[] = sectionsToGenerate
      .filter(type => type !== 'divider')
      .map(type => ({
        type,
        content: (parsed.sections[type] ?? {}) as SectionContent,
      }));

    // Interleave dividers if requested
    const finalSections: EmailSection[] = [];
    for (let i = 0; i < sectionsToGenerate.length; i++) {
      const type = sectionsToGenerate[i];
      if (type === 'divider') {
        finalSections.push({ type: 'divider', content: {} as DividerContent });
      } else {
        const found = sections.find(s => s.type === type);
        if (found) finalSections.push(found);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      subject: parsed.subject,
      previewText: parsed.previewText ?? '',
      sections: finalSections,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('generate-email-template error:', msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

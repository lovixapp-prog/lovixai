import { corsResponse, jsonResponse } from '../_shared/cors';
import type { Env } from '../_shared/auth';

type AgentIntent =
  | 'video'
  | 'image'
  | 'ugc'
  | 'influencer'
  | 'motion'
  | 'creations'
  | 'assets'
  | 'credits'
  | 'chat';

type ChatAgentRequest = {
  message: string;
  localResult?: {
    intent?: AgentIntent;
    responseText?: string;
    needsPlan?: boolean;
    settings?: Record<string, unknown>;
    plan?: unknown;
  };
  history?: { role: 'user' | 'assistant'; content: string }[];
};

const SYSTEM_PROMPT = `You are LOVIX AI, a senior creative marketing agent inside an AI video project app.

Your job:
- Always write every visible user-facing field in English, even if the user writes in another language.
- Treat each prompt as a single video project brief, not as an open-ended conversation.
- Create an editable action plan before generation.
- The final output is a marketing video. Images, avatars, product references, and generated visuals are support assets for the video.
- Be practical: the agent prepares the creative plan, storyboard, script beats, visual references, CTA, and final generation prompt.
- Never claim a generation is finished. You only plan, route, or prepare the next action.

Return ONLY valid JSON. No markdown, no code fences.

JSON schema:
{
  "responseText": "short conversational answer",
  "needsPlan": boolean,
  "plan": null or {
    "title": "string",
    "summary": "string",
    "strategy": "string",
    "deliverable": "string",
    "format": "string",
    "duration": "string",
    "audience": "string",
    "hook": "string",
    "scriptOutline": ["string"],
    "shotList": [{ "title": "string", "detail": "string" }],
    "productionNotes": ["string"],
    "finalPrompt": "string",
    "riskNotes": ["string"],
    "estimatedCredits": "string",
    "ugcBrief": null or {
      "productName": "",
      "productUrl": "",
      "offerType": "product|service|app|other",
      "influencerMode": "my_influencer|generate_new|upload_creator|no_preference",
      "platform": "tiktok|instagram|youtube|meta|multi",
      "aspectRatio": "9:16|1:1|16:9",
      "durationSeconds": "15|30|45|60",
      "visualStyle": "authentic|cinematic|social|premium",
      "language": "string",
      "callToAction": "string"
    }
  }
}`;

const PLAN_SYSTEM_PROMPT = `You are LOVIX AI, a senior marketing strategist, AI creative director, and video production agent.

The user has started a single LOVIX video project. You MUST create a detailed approval plan before generation.
Always write every visible user-facing field in English, even if the user writes in another language.

Important behavior:
- Do not behave like a generic chatbot.
- Prepare a real marketing video plan: objective, audience, length, format, hook, scene plan, effects, assets/images needed, avatar/influencer usage, CTA, and final Seedance-ready prompt.
- If the video needs generated images or references, include them in productionNotes and finalPrompt as required visual assets.
- If the project is UGC/avatar-based, fill ugcBrief with editable defaults.
- The plan must feel specifically tailored to the user's prompt, selected avatar/creator mode, uploaded/reference asset context, format, platform, duration, product, URL, and CTA when those are present in localDetection.settings.
- Do not create generic filler. The script beats, scenes, hook, CTA, and final prompt must reflect the exact user request.
- The UI is read-only: if the user wants changes, they will tell the agent in chat. Do not describe inline editable fields.

Return ONLY valid JSON. No markdown, no code fences.

Required JSON schema:
{
  "responseText": "short sentence introducing the plan",
  "needsPlan": true,
  "plan": {
    "title": "string",
    "summary": "string",
    "strategy": "string",
    "deliverable": "string",
    "format": "string",
    "duration": "string",
    "audience": "string",
    "hook": "string",
    "scriptOutline": ["4-8 concrete beats"],
    "shotList": [
      { "title": "shot title", "detail": "specific visual/action detail" }
    ],
    "productionNotes": ["practical generation notes"],
    "finalPrompt": "complete generation-ready prompt",
    "riskNotes": ["missing info or quality risks"],
    "estimatedCredits": "string",
    "ugcBrief": null or {
      "productName": "",
      "productUrl": "",
      "offerType": "product|service|app|other",
      "influencerMode": "my_influencer|generate_new|upload_creator|no_preference",
      "platform": "tiktok|instagram|youtube|meta|multi",
      "aspectRatio": "9:16|1:1|16:9",
      "durationSeconds": "15|30|45|60",
      "visualStyle": "authentic|cinematic|social|premium",
      "language": "string",
      "callToAction": "string"
    }
  }
}`;

const FALLBACK_MODEL = 'openrouter/free';
const FALLBACK_PLAN_MODEL = 'google/gemini-2.5-flash-lite';

function safeJsonParse(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizePlan(plan: any, localPlan: unknown) {
  if (!plan || typeof plan !== 'object') return null;
  return {
    title: String(plan.title ?? ''),
    summary: String(plan.summary ?? ''),
    strategy: String(plan.strategy ?? ''),
    deliverable: String(plan.deliverable ?? ''),
    format: String(plan.format ?? ''),
    duration: String(plan.duration ?? ''),
    audience: String(plan.audience ?? ''),
    hook: String(plan.hook ?? ''),
    scriptOutline: Array.isArray(plan.scriptOutline) ? plan.scriptOutline.map(String).slice(0, 8) : [],
    shotList: Array.isArray(plan.shotList)
      ? plan.shotList.slice(0, 8).map((step: any) => ({
          title: String(step?.title ?? ''),
          detail: String(step?.detail ?? ''),
        }))
      : [],
    productionNotes: Array.isArray(plan.productionNotes) ? plan.productionNotes.map(String).slice(0, 8) : [],
    finalPrompt: String(plan.finalPrompt ?? ''),
    riskNotes: Array.isArray(plan.riskNotes) ? plan.riskNotes.map(String).slice(0, 6) : [],
    estimatedCredits: String(plan.estimatedCredits ?? ''),
    ugcBrief: plan.ugcBrief && typeof plan.ugcBrief === 'object' ? {
      productName: String(plan.ugcBrief.productName ?? ''),
      productUrl: String(plan.ugcBrief.productUrl ?? ''),
      offerType: plan.ugcBrief.offerType ?? 'product',
      influencerMode: plan.ugcBrief.influencerMode ?? 'my_influencer',
      platform: plan.ugcBrief.platform ?? 'multi',
      aspectRatio: plan.ugcBrief.aspectRatio ?? '9:16',
      durationSeconds: plan.ugcBrief.durationSeconds ?? '30',
      visualStyle: plan.ugcBrief.visualStyle ?? 'authentic',
      language: String(plan.ugcBrief.language ?? 'English'),
      callToAction: String(plan.ugcBrief.callToAction ?? 'Shop now'),
    } : undefined,
  };
}

export const onRequestOptions: PagesFunction = async () => corsResponse();

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { message, localResult, history = [] } = await request.json() as ChatAgentRequest;
    if (!message?.trim()) throw new Error('Message is required');

    if (!env.OPENROUTER_API_KEY) {
      return jsonResponse({
        success: false,
        error: 'OPENROUTER_API_KEY not configured',
      }, 400);
    }

    const wantsPlan = Boolean(localResult?.needsPlan);
    const model = wantsPlan
      ? (env.OPENROUTER_PLAN_MODEL || env.OPENROUTER_CHAT_MODEL || FALLBACK_PLAN_MODEL)
      : (env.OPENROUTER_CHAT_MODEL || FALLBACK_MODEL);
    const recentHistory = history
      .slice(-8)
      .filter(m => m.content?.trim())
      .map(m => ({ role: m.role, content: m.content.slice(0, 1600) }));

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovix.app',
        'X-Title': 'LOVIX AI',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: wantsPlan ? PLAN_SYSTEM_PROMPT : SYSTEM_PROMPT },
          ...recentHistory,
          {
            role: 'user',
            content: JSON.stringify({
              message,
              localDetection: localResult ?? null,
              instruction: wantsPlan
                ? 'Create the compact approval plan now. needsPlan must be true and plan must be a complete object. Keep every field in English and tailor it to localDetection.settings.'
                : 'Improve the chat answer.',
            }),
          },
        ],
        temperature: 0.55,
        max_tokens: wantsPlan ? 2200 : 600,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return jsonResponse({ success: false, error: `OpenRouter error ${res.status}: ${err}` }, 502);
    }

    const data = await res.json() as any;
    const content = data.choices?.[0]?.message?.content ?? '';
    const parsed = safeJsonParse(content);

    if (!parsed) {
      if (wantsPlan) {
        return jsonResponse({
          success: false,
          error: 'The AI agent did not return valid JSON for the plan.',
          model: data.model ?? model,
        }, 502);
      }

      return jsonResponse({
        success: true,
        result: {
          responseText: String(content || localResult?.responseText || ''),
          needsPlan: false,
          plan: null,
          model: data.model ?? model,
        },
      });
    }

    const normalizedPlan = normalizePlan(parsed.plan, null);
    if (wantsPlan && !normalizedPlan) {
      return jsonResponse({
        success: false,
        error: 'The AI agent did not return a valid editable plan.',
        model: data.model ?? model,
      }, 502);
    }

    return jsonResponse({
      success: true,
      result: {
        responseText: String(parsed.responseText ?? localResult?.responseText ?? ''),
        needsPlan: Boolean(parsed.needsPlan || wantsPlan),
        plan: normalizedPlan,
        model: data.model ?? model,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 400);
  }
};

import { corsResponse, jsonResponse } from '../_shared/cors';
import type { Env } from '../_shared/auth';

const SYSTEM_PROMPT = `You are a content compliance assistant. Your task is to rewrite prompts for video generation to ensure they comply with content policies while preserving the original creative intent as much as possible.

Rules to enforce:
1. NO real celebrities, public figures, politicians, or copyrighted characters by name
2. NO nudity, explicit content, sexual suggestions, or revealing clothing descriptions
3. NO violence, gore, blood, weapons, or disturbing imagery
4. NO hate speech, discrimination, slurs, or offensive content
5. NO brand names, logos, trademarked content, or copyrighted music/movies
6. NO minors in any suggestive context
7. NO deepfake-style requests or impersonation of real people

If the prompt violates any rule:
- Replace celebrity/public figure names with generic descriptions
- Replace copyrighted characters with generic equivalents
- Remove or soften explicit/violent content while keeping the scene intent
- Replace brand names with generic terms
- Convert suggestive clothing to appropriate alternatives

If the prompt is already fully compliant, return it EXACTLY unchanged.

CRITICAL: Always respond with ONLY the rewritten prompt text. No explanations, no prefixes, just the prompt itself.`;

export const onRequestOptions: PagesFunction = async () => corsResponse();

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { prompt } = await request.json() as { prompt: string };

    if (!prompt || !env.OPENAI_API_KEY) {
      return jsonResponse({ sanitizedPrompt: prompt || '', wasModified: false });
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!res.ok) {
      return jsonResponse({ sanitizedPrompt: prompt, wasModified: false });
    }

    const data = await res.json() as any;
    const sanitizedPrompt = data.choices?.[0]?.message?.content?.trim() || prompt;
    const wasModified = sanitizedPrompt.toLowerCase() !== prompt.toLowerCase();

    return jsonResponse({ sanitizedPrompt, wasModified });
  } catch {
    return jsonResponse({ sanitizedPrompt: '', wasModified: false }, 500);
  }
};

import { corsResponse, jsonResponse } from '../_shared/cors';
import type { Env } from '../_shared/auth';

const systemPrompts = {
  image: `You are an expert AI image prompt engineer. Your task is to enhance user prompts to generate stunning, high-quality images.

RULES:
- Keep the core idea/subject from the original prompt
- Add rich visual details: lighting, mood, composition, style
- Include technical quality terms like "ultra high resolution", "4K", "detailed", "professional"
- Add artistic direction when appropriate (cinematic, photorealistic, dramatic lighting, etc.)
- Keep the enhanced prompt under 200 words
- Output ONLY the enhanced prompt, no explanations
- Write in the same language as the input prompt`,

  video: `You are an expert AI video prompt engineer for Kling AI. Your task is to enhance user prompts to generate stunning, cinematic AI videos.

RULES:
- Keep the core idea/subject from the original prompt
- Add camera movement descriptions (slow pan, tracking shot, dolly zoom, etc.)
- Include mood, lighting, and atmospheric details
- Add motion descriptions (how subjects move, interact with environment)
- Include cinematic terms (depth of field, lens flare, golden hour, etc.)
- Describe the scene progression if relevant
- Keep the enhanced prompt under 200 words
- Output ONLY the enhanced prompt, no explanations
- Write in the same language as the input prompt`,

  ugc: `You are an expert UGC (User Generated Content) video script writer for social media marketing. Given product information, write a compelling, authentic-sounding script for a short video ad.

RULES:
- Write as if a real person is casually talking about the product they genuinely love
- Start with an attention-grabbing hook — the first 5 words must stop the scroll
- Naturally highlight 2-3 key product benefits (not a features list — weave them into the story)
- Sound genuine and conversational, never corporate or scripted
- End with a subtle, natural-sounding call to action
- Keep it between 60-130 words — suitable for a 5-10 second video
- Output ONLY the script text — no scene directions, no stage notes, no quotes around it
- Write in the same language as the product information provided`,
};

export const onRequestOptions: PagesFunction = async () => corsResponse();

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

    const { prompt, type, context, referenceImage } = await request.json() as {
      prompt: string;
      type: 'image' | 'video' | 'ugc';
      context?: string;
      referenceImage?: string;
    };

    if (!prompt) throw new Error('Prompt is required');
    if (!type || !['image', 'video', 'ugc'].includes(type)) throw new Error('Type must be "image", "video", or "ugc"');

    // Multimodal: video + reference image (influencer) — use GPT-4o vision
    if (type === 'video' && referenceImage) {
      const systemPrompt = `You are an expert AI video prompt engineer for Kling AI. Your task is to enhance user prompts to generate videos that feature the EXACT person shown in the reference image.

CRITICAL RULES:
1. ANALYZE the reference image CAREFULLY - study every detail of the person's appearance
2. DESCRIBE the person's EXACT physical features in the prompt
3. The video MUST feature THIS EXACT PERSON - do not change any physical features
4. Enhance the ACTION/SCENE with camera movements, lighting, mood, cinematic terms
5. Keep the enhanced prompt under 250 words
6. Output ONLY the enhanced prompt, no explanations
7. Write in the same language as the input prompt`;

      const userContent: any[] = [
        { type: 'text', text: `Study this person carefully. The video must feature this EXACT person.` },
        { type: 'image_url', image_url: { url: referenceImage, detail: 'high' } },
        { type: 'text', text: `User's video request: "${prompt}"${context ? `\n\nAdditional context: ${context}` : ''}\n\nCreate an optimized Kling AI video prompt starting with a detailed description of this exact person's appearance, then describe the requested action/scene with cinematic enhancements.` },
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          max_tokens: 600,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        if (res.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
        throw new Error(`Failed to optimize prompt: ${res.status} - ${err}`);
      }

      const data = await res.json() as any;
      const optimizedPrompt = data.choices?.[0]?.message?.content?.trim();
      if (!optimizedPrompt) throw new Error('No optimized prompt generated');

      return jsonResponse({ success: true, optimizedPrompt });
    }

    // Text-only optimization
    const userMessage = type === 'ugc'
      ? `Write a UGC video script for this product:\n\n${prompt}${context ? `\n\nExtra context: ${context}` : ''}`
      : `Enhance this ${type} prompt:\n\n"${prompt}"`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompts[type] },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      if (res.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
      throw new Error(`Failed to optimize prompt: ${res.status} - ${err}`);
    }

    const data = await res.json() as any;
    const optimizedPrompt = data.choices?.[0]?.message?.content?.trim();
    if (!optimizedPrompt) throw new Error('No optimized prompt generated');

    return jsonResponse({ success: true, optimizedPrompt });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 400);
  }
};

import { corsResponse, jsonResponse } from '../_shared/cors';
import { getUser, type Env } from '../_shared/auth';

async function generateKlingJWT(accessKey: string, secretKey: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: accessKey, exp: now + 1800, nbf: now - 5 };

  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const data = `${encode(header)}.${encode(payload)}`;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${data}.${sigB64}`;
}

export const onRequestOptions: PagesFunction = async () => corsResponse();

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!env.KLING_ACCESS_KEY || !env.KLING_SECRET_KEY)
      throw new Error('KLING_ACCESS_KEY or KLING_SECRET_KEY not configured');

    const { user, supabase } = await getUser(request, env);

    const { prompt, seconds, aspectRatio, quality, type = 'video', referenceImageUrl } =
      await request.json() as {
        prompt: string;
        seconds: number;
        aspectRatio: string;
        quality: string;
        type?: string;
        referenceImageUrl?: string;
      };
    if (!prompt) throw new Error('Prompt is required');

    // Sanitize prompt
    let finalPrompt = prompt;
    try {
      const sanitizeRes = await fetch(new URL('/api/sanitize-prompt', request.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (sanitizeRes.ok) {
        const sd = await sanitizeRes.json() as any;
        finalPrompt = sd.sanitizedPrompt || prompt;
      }
    } catch { /* use original prompt */ }

    const klingDuration = seconds >= 8 ? '10' : '5';
    // Pro mode required for v2.6 audio — always use pro rates
    const baseCost = klingDuration === '10' ? 450 : 225;
    const creditsRequired = baseCost;

    const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
    if (!profile || profile.credits < creditsRequired)
      throw new Error(`Insufficient credits. Required: ${creditsRequired}, Available: ${profile?.credits ?? 0}`);

    const klingToken = await generateKlingJWT(env.KLING_ACCESS_KEY, env.KLING_SECRET_KEY);
    const klingAspectRatio = aspectRatio === '9:16' ? '9:16' : aspectRatio === '1:1' ? '1:1' : '16:9';
    const negativePrompt = 'blurry, distorted, low quality, watermark, text overlay, artifacts';

    let apiEndpoint: string;
    let requestBody: Record<string, unknown>;

    if (referenceImageUrl) {
      apiEndpoint = 'https://api.klingai.com/v1/videos/image2video';
      requestBody = {
        model_name: 'kling-v2-6',
        image: referenceImageUrl,
        prompt: finalPrompt,
        negative_prompt: negativePrompt,
        mode: 'pro',
        duration: klingDuration,
        cfg_scale: 0.5,
        sound: 'on',
      };
    } else {
      apiEndpoint = 'https://api.klingai.com/v1/videos/text2video';
      requestBody = {
        model_name: 'kling-v2-6',
        prompt: finalPrompt,
        negative_prompt: negativePrompt,
        cfg_scale: 0.5,
        mode: 'pro',
        aspect_ratio: klingAspectRatio,
        duration: klingDuration,
        sound: 'on',
      };
    }

    const klingRes = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${klingToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!klingRes.ok) {
      const err = await klingRes.text();
      throw new Error(`Kling AI error: ${klingRes.status} - ${err}`);
    }

    const klingData = await klingRes.json() as any;
    if (klingData.code !== 0) throw new Error(`Kling AI error: ${klingData.message}`);

    const taskId = klingData.data?.task_id;
    if (!taskId) throw new Error('No task ID returned from Kling AI');

    const { data: generation } = await supabase
      .from('generations')
      .insert({
        user_id: user.id, type, prompt,
        settings: { seconds, aspectRatio, quality, referenceImageUrl },
        status: 'processing', external_id: taskId, credits_used: creditsRequired,
      })
      .select().single();

    await supabase.from('profiles').update({ credits: profile.credits - creditsRequired }).eq('id', user.id);

    return jsonResponse({ success: true, generationId: generation?.id, videoId: taskId, creditsUsed: creditsRequired });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 400);
  }
};

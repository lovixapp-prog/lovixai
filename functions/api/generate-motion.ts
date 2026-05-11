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

    const klingToken = await generateKlingJWT(env.KLING_ACCESS_KEY, env.KLING_SECRET_KEY);
    const { user, supabase } = await getUser(request, env);

    const {
      videoUrl, imageUrl, audioUrl,
      characterOrientation, quality, keepOriginalSound,
      prompt, type, duration, cfgScale,
    } = await request.json() as {
      videoUrl?: string; imageUrl?: string; audioUrl?: string;
      characterOrientation?: string; quality?: string; keepOriginalSound?: boolean;
      prompt?: string; type?: string; duration?: string; cfgScale?: number;
    };

    if (!videoUrl && !imageUrl && !audioUrl) throw new Error('At least one input URL must be provided');

    const safePrompt = prompt?.trim() || 'natural smooth motion, cinematic movement';
    const negativePrompt = 'blurry, distorted, low quality, watermark, text overlay, artifacts';
    const klingMode = quality === 'pro' ? 'pro' : 'std';
    const klingDuration = duration || '5';
    const klingCfg = cfgScale ?? 0.5;

    let apiEndpoint: string;
    let requestBody: Record<string, unknown>;
    let motionType: string;
    let creditsRequired: number;

    if (audioUrl && videoUrl) {
      // Lip sync: video + audio
      apiEndpoint = 'https://api.klingai.com/v1/videos/lip-sync';
      requestBody = {
        video_url: videoUrl,
        audio_url: audioUrl,
        mode: klingMode,
      };
      motionType = 'lip-sync';
      creditsRequired = quality === 'pro' ? 200 : 150;

    } else if (videoUrl && imageUrl) {
      // True motion control: transfer motion from reference video to character image
      // Uses dedicated /motion-control endpoint — both image_url AND video_url required
      apiEndpoint = 'https://api.klingai.com/v1/videos/motion-control';
      requestBody = {
        model_name: 'kling-v2-6',
        image_url: imageUrl,
        video_url: videoUrl,
        prompt: safePrompt,
        negative_prompt: negativePrompt,
        character_orientation: characterOrientation || 'video',
        mode: klingMode,
        duration: klingDuration,
        cfg_scale: klingCfg,
      };
      motionType = 'motion-control';
      creditsRequired = quality === 'pro' ? 250 : 200;

    } else if (imageUrl) {
      // Image-to-video: animate a single image
      apiEndpoint = 'https://api.klingai.com/v1/videos/image2video';
      requestBody = {
        model_name: 'kling-v2-6',
        image: imageUrl,
        prompt: safePrompt,
        negative_prompt: negativePrompt,
        mode: 'pro',
        duration: klingDuration,
        cfg_scale: klingCfg,
        sound: 'on',
      };
      motionType = 'image2video';
      creditsRequired = 225;

    } else {
      throw new Error('Invalid inputs combination');
    }

    const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
    if (!profile || profile.credits < creditsRequired)
      throw new Error(`Insufficient credits. Required: ${creditsRequired}, Available: ${profile?.credits ?? 0}`);

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${klingToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    if (!response.ok) throw new Error(`Kling AI error: ${response.status} - ${responseText}`);

    const data = JSON.parse(responseText) as any;
    const requestId = data.data?.task_id || data.task_id || data.id;
    if (!requestId) throw new Error('No task ID returned from Kling AI: ' + JSON.stringify(data));

    const generationType = type || 'motion';
    const { data: generation } = await supabase
      .from('generations')
      .insert({
        user_id: user.id, type: generationType, prompt: prompt || null,
        settings: { videoUrl, imageUrl, characterOrientation, quality, keepOriginalSound, motionType, duration: klingDuration, cfgScale: klingCfg },
        status: 'processing', external_id: requestId, credits_used: creditsRequired,
      })
      .select().single();

    await supabase.from('profiles').update({ credits: profile.credits - creditsRequired }).eq('id', user.id);

    return jsonResponse({ success: true, generationId: generation?.id, taskId: requestId, creditsUsed: creditsRequired, motionType });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 400);
  }
};

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
    const { user, supabase } = await getUser(request, env);

    const { videoUrl, audioUrl, originalGenerationId } = await request.json() as {
      videoUrl: string;
      audioUrl: string;
      originalGenerationId: string;
    };

    if (!videoUrl || !audioUrl) throw new Error('videoUrl and audioUrl are required');

    const klingToken = await generateKlingJWT(env.KLING_ACCESS_KEY, env.KLING_SECRET_KEY);

    const klingRes = await fetch('https://api.klingai.com/v1/videos/lip-sync', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${klingToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_url: videoUrl, audio_url: audioUrl, mode: 'pro' }),
    });

    if (!klingRes.ok) {
      const err = await klingRes.text();
      throw new Error(`Kling lip-sync error: ${klingRes.status} - ${err}`);
    }

    const klingData = await klingRes.json() as any;
    if (klingData.code !== 0) throw new Error(`Kling lip-sync error: ${klingData.message}`);

    const taskId = klingData.data?.task_id;
    if (!taskId) throw new Error('No task ID from Kling lip-sync');

    const { data: generation } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        type: 'ugc-final',
        prompt: 'UGC lip-sync',
        settings: { originalGenerationId, videoUrl, audioUrl, motionType: 'lip-sync' },
        status: 'processing',
        external_id: taskId,
        credits_used: 0,
      })
      .select()
      .single();

    return jsonResponse({ success: true, generationId: generation?.id, taskId });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 400);
  }
};

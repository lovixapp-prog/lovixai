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
    const { generationId } = await request.json() as { generationId: string };
    if (!generationId) throw new Error('Generation ID is required');

    const { data: generation } = await supabase
      .from('generations').select('*').eq('id', generationId).eq('user_id', user.id).single();
    if (!generation) throw new Error('Generation not found');

    if (generation.status === 'completed') return jsonResponse({ status: 'completed', resultUrl: generation.result_url });
    if (generation.status === 'failed') return jsonResponse({ status: 'failed', error: generation.error_message });

    const settings = generation.settings as { motionType?: string } | null;
    const motionType = settings?.motionType;

    let statusEndpoint: string;
    if (motionType === 'lip-sync') {
      statusEndpoint = `https://api.klingai.com/v1/videos/lip-sync/${generation.external_id}`;
    } else if (motionType === 'motion-control') {
      statusEndpoint = `https://api.klingai.com/v1/videos/motion-control/${generation.external_id}`;
    } else {
      statusEndpoint = `https://api.klingai.com/v1/videos/image2video/${generation.external_id}`;
    }

    const response = await fetch(statusEndpoint, {
      headers: { 'Authorization': `Bearer ${klingToken}` },
    });

    const responseText = await response.text();
    if (!response.ok) throw new Error(`Failed to check motion status: ${response.status} - ${responseText}`);

    const data = JSON.parse(responseText) as any;
    const taskData = data.data;
    const status = taskData?.task_status || data.status;
    const works = taskData?.task_result?.videos || [];
    const videoUrl = works.length > 0 ? works[0].url : null;

    if ((status === 'succeed' || status === 'completed') && videoUrl) {
      await supabase.from('generations').update({ status: 'completed', result_url: videoUrl }).eq('id', generationId);
      return jsonResponse({ status: 'completed', resultUrl: videoUrl });
    }

    if (status === 'failed') {
      const errorMessage = taskData?.task_status_msg || 'Motion generation failed';
      await supabase.from('generations').update({ status: 'failed', error_message: errorMessage }).eq('id', generationId);
      return jsonResponse({ status: 'failed', error: errorMessage });
    }

    return jsonResponse({ status: 'processing', progress: taskData?.progress || data.progress });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ status: 'error', error: msg }, 400);
  }
};

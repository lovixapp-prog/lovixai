import { corsResponse, jsonResponse } from '../_shared/cors';
import { getUser, adminClient, type Env } from '../_shared/auth';

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
    const { generationId } = await request.json() as { generationId: string };
    if (!generationId) throw new Error('Generation ID is required');

    const { data: generation } = await supabase
      .from('generations')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', user.id)
      .single();

    if (!generation) throw new Error('Generation not found');

    if (generation.status === 'completed') return jsonResponse({ status: 'completed', resultUrl: generation.result_url });
    if (generation.status === 'failed') return jsonResponse({ status: 'failed', error: generation.error_message });

    const taskId = generation.external_id;
    const klingToken = await generateKlingJWT(env.KLING_ACCESS_KEY, env.KLING_SECRET_KEY);

    // Determine endpoint: image2video or text2video
    const isImage2Video = generation.settings?.referenceImageUrl;
    const endpoint = isImage2Video
      ? `https://api.klingai.com/v1/videos/image2video/${taskId}`
      : `https://api.klingai.com/v1/videos/text2video/${taskId}`;

    const pollRes = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${klingToken}` },
    });

    if (!pollRes.ok) throw new Error(`Failed to poll Kling task: ${pollRes.status}`);

    const taskData = await pollRes.json() as any;
    if (taskData.code !== 0) throw new Error(`Kling API error: ${taskData.message}`);

    const taskStatus = taskData.data?.task_status;
    const supabaseAdmin = adminClient(env);

    if (taskStatus === 'failed') {
      const errMsg = taskData.data?.task_status_msg || 'Video generation failed';
      await supabaseAdmin.from('generations').update({ status: 'failed', error_message: errMsg }).eq('id', generationId);
      return jsonResponse({ status: 'failed', error: errMsg });
    }

    if (taskStatus !== 'succeed') {
      return jsonResponse({ status: 'processing' });
    }

    // Extract video URL from completed task
    const videos = taskData.data?.task_result?.videos || [];
    if (!videos.length) throw new Error('No videos in Kling response');

    const videoUrl: string = videos[0]?.url;
    if (!videoUrl) throw new Error('No video URL in Kling response');

    // Save Kling URL directly — avoids CF Worker timeout from re-downloading large video files
    await supabaseAdmin.from('generations').update({ status: 'completed', result_url: videoUrl }).eq('id', generationId);

    return jsonResponse({ status: 'completed', resultUrl: videoUrl });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ status: 'error', error: msg }, 400);
  }
};

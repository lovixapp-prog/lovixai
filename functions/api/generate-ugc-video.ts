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

function buildPrompt(productName: string, productDesc: string, style: string, script: string): string {
  const styleMap: Record<string, string> = {
    authentic: 'natural lighting, handheld camera, candid lifestyle feel',
    cinematic: 'cinematic lighting, smooth camera movement, premium aesthetic',
    social: 'vibrant colors, energetic, modern social media aesthetic',
    storytelling: 'warm natural tones, emotional and personal feel',
  };
  const styleHint = styleMap[style] || styleMap.authentic;
  const scriptHint = script ? ` Theme: ${script.substring(0, 100)}` : '';
  const descHint = productDesc ? ` ${productDesc.substring(0, 80)}` : '';
  return `Product lifestyle video. ${productName}${descHint} — person naturally holding and showcasing the product, smiling, ${styleHint}, shallow depth of field, clean background.${scriptHint}`;
}

export const onRequestOptions: PagesFunction = async () => corsResponse();

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { user, supabase } = await getUser(request, env);

    const {
      influencerImageUrl,
      productImageUrl,
      productName,
      productDescription = '',
      productId,
      script,
      duration = 5,
      aspectRatio = '9:16',
      style = 'authentic',
    } = await request.json() as {
      influencerImageUrl?: string;
      productImageUrl?: string;
      productName: string;
      productDescription?: string;
      productId?: string;
      script: string;
      duration?: number;
      aspectRatio?: string;
      style?: string;
    };

    if (!productName) throw new Error('Product name is required');
    if (!script) throw new Error('Script is required');

    const klingDuration = duration >= 8 ? '10' : '5';
    const creditsRequired = klingDuration === '10' ? 450 : 225;

    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('credits').eq('id', user.id).single();
    if (profileError || !profile) throw new Error('Profile not found');
    if (profile.credits < creditsRequired)
      throw new Error(`Insufficient credits. Required: ${creditsRequired}, Available: ${profile.credits}`);

    // TTS audio from script
    let audioUrl: string | null = null;
    if (script && env.OPENAI_API_KEY) {
      try {
        const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'tts-1', voice: 'nova', input: script.substring(0, 500), response_format: 'mp3' }),
        });
        if (ttsRes.ok) {
          const audioBuf = await ttsRes.arrayBuffer();
          const audioFilename = `${user.id}/ugc-audio/${Date.now()}.mp3`;
          const admin = adminClient(env);
          const { error: uploadErr } = await admin.storage
            .from('generations').upload(audioFilename, audioBuf, { contentType: 'audio/mpeg', upsert: false });
          if (!uploadErr) {
            audioUrl = admin.storage.from('generations').getPublicUrl(audioFilename).data.publicUrl;
          }
        }
      } catch { /* audio optional, continue */ }
    }

    const klingToken = await generateKlingJWT(env.KLING_ACCESS_KEY, env.KLING_SECRET_KEY);
    const klingAspect = aspectRatio === '9:16' ? '9:16' : aspectRatio === '1:1' ? '1:1' : '16:9';
    const prompt = buildPrompt(productName, productDescription, style, script);
    const negativePrompt = 'blurry, distorted, low quality, watermark, text overlay, cartoon, animation';

    // Reference image priority: influencer > product image > text2video
    const referenceImageUrl = influencerImageUrl || productImageUrl || null;

    let apiEndpoint: string;
    let requestBody: Record<string, unknown>;

    if (referenceImageUrl) {
      apiEndpoint = 'https://api.klingai.com/v1/videos/image2video';
      requestBody = {
        model_name: 'kling-v2-6',
        image: referenceImageUrl,
        prompt,
        negative_prompt: negativePrompt,
        mode: 'pro',
        duration: klingDuration,
        cfg_scale: 0.7,
        sound: 'on',
      };
    } else {
      apiEndpoint = 'https://api.klingai.com/v1/videos/text2video';
      requestBody = {
        model_name: 'kling-v2-6',
        prompt,
        negative_prompt: negativePrompt,
        cfg_scale: 0.5,
        mode: 'pro',
        aspect_ratio: klingAspect,
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
      throw new Error(`Kling error ${klingRes.status}: ${err}`);
    }

    const klingData = await klingRes.json() as any;
    if (klingData.code !== 0) throw new Error(`Kling error: ${klingData.message} (code ${klingData.code})`);

    const taskId = klingData.data?.task_id;
    if (!taskId) throw new Error('No task ID from Kling');

    const supabaseAdmin = adminClient(env);
    const { data: generation, error: genError } = await supabaseAdmin
      .from('generations')
      .insert({
        user_id: user.id,
        type: 'ugc',
        prompt,
        settings: {
          productName, productDescription, productId, script,
          duration, aspectRatio, style, audioUrl,
          referenceImageUrl,
          influencerImageUrl: influencerImageUrl || null,
          productImageUrl: productImageUrl || null,
        },
        status: 'processing',
        external_id: taskId,
        credits_used: creditsRequired,
      })
      .select()
      .single();

    if (genError) throw new Error(`DB insert error: ${genError.message}`);

    await supabase.from('profiles')
      .update({ credits: profile.credits - creditsRequired }).eq('id', user.id);

    return jsonResponse({ success: true, generationId: generation?.id, taskId, audioUrl, creditsUsed: creditsRequired });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 400);
  }
};

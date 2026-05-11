import { corsResponse, jsonResponse } from '../_shared/cors';
import { getUser, type Env } from '../_shared/auth';

async function resizeImageForVideo(baseUrl: string, imageUrl: string, poseId: string, userId: string) {
  try {
    await fetch(`${baseUrl}/api/resize-image-for-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, poseId, userId }),
    });
  } catch (err) {
    console.error('Background resize error:', err);
  }
}

export const onRequestOptions: PagesFunction = async () => corsResponse();

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

    const { user, supabase } = await getUser(request, env);

    const { influencerId, referenceImageUrl, prompt, influencerDetails, isFirstPose } =
      await request.json() as {
        influencerId: string;
        referenceImageUrl: string;
        prompt?: string;
        influencerDetails?: { name?: string; gender?: string; ageRange?: string; ethnicity?: string; hairStyle?: string; fashionStyle?: string };
        isFirstPose?: boolean;
      };

    if (!influencerId || !referenceImageUrl) throw new Error('Influencer ID and reference image are required');

    const creditsRequired = isFirstPose ? 0 : 30;

    const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
    if (!profile) throw new Error('Could not fetch user profile');
    if (!isFirstPose && profile.credits < creditsRequired)
      throw new Error(`Insufficient credits. Required: ${creditsRequired}, Available: ${profile.credits}`);

    const detailedPrompt = `Generate a new photo of the EXACT SAME person shown in the reference image.
CRITICAL: The face, facial features, skin tone, and overall appearance must be IDENTICAL to the reference image.
The person is: ${influencerDetails?.name || 'an influencer'}, ${influencerDetails?.gender || ''}, ${influencerDetails?.ageRange || ''}.
${influencerDetails?.ethnicity ? `Ethnicity: ${influencerDetails.ethnicity}.` : ''}
${influencerDetails?.hairStyle ? `Hair style: ${influencerDetails.hairStyle}.` : ''}
${influencerDetails?.fashionStyle ? `Fashion style: ${influencerDetails.fashionStyle}.` : ''}

New pose/scene: ${prompt || 'A natural, confident pose with a different angle or expression'}

IMPORTANT:
- Keep the EXACT same face and facial features
- Same skin tone and complexion
- Same hair color and style
- Only change the pose, expression, angle, or background
- Ultra high resolution, professional photography quality`;

    // Download reference image
    const imgRes = await fetch(referenceImageUrl);
    if (!imgRes.ok) throw new Error('Failed to download reference image');
    const imgBuf = await imgRes.arrayBuffer();
    const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';

    const formData = new FormData();
    formData.append('model', 'gpt-image-1');
    formData.append('prompt', detailedPrompt);
    formData.append('n', '1');
    formData.append('size', '1024x1024');
    formData.append('image', new Blob([imgBuf], { type: mimeType }), 'reference.png');

    const openaiRes = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.OPENAI_API_KEY}` },
      body: formData,
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      if (openaiRes.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
      throw new Error(`Pose generation failed: ${openaiRes.status} - ${err}`);
    }

    const openaiData = await openaiRes.json() as any;
    const b64 = openaiData.data?.[0]?.b64_json;
    if (!b64) throw new Error('No image generated');

    const imageBytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));

    const filename = `${user.id}/influencer-poses/${influencerId}/${Date.now()}-${crypto.randomUUID()}.png`;
    const { error: uploadError } = await supabase.storage
      .from('generations')
      .upload(filename, imageBytes, { contentType: 'image/png', upsert: false });
    if (uploadError) throw new Error('Failed to save image');

    const { data: urlData } = supabase.storage.from('generations').getPublicUrl(filename);
    const resultImageUrl = urlData.publicUrl;

    const { data: pose } = await supabase
      .from('influencer_poses')
      .insert({ influencer_id: influencerId, user_id: user.id, image_url: resultImageUrl, prompt, is_original: false })
      .select().single();

    if (creditsRequired > 0) {
      await supabase.from('profiles').update({ credits: profile.credits - creditsRequired }).eq('id', user.id);
    }

    if (pose?.id) {
      const baseUrl = new URL(request.url).origin;
      resizeImageForVideo(baseUrl, resultImageUrl, pose.id, user.id).catch(console.error);
    }

    return jsonResponse({ success: true, imageUrl: resultImageUrl, poseId: pose?.id, creditsUsed: creditsRequired });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 400);
  }
};

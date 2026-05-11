import { corsResponse, jsonResponse } from '../_shared/cors';
import { getUser, type Env } from '../_shared/auth';

export const onRequestOptions: PagesFunction = async () => corsResponse();

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

    const { user, supabase } = await getUser(request, env);

    const { prompt, style, imageUrl: sourceImageUrl } = await request.json() as {
      prompt: string;
      style?: string;
      imageUrl?: string;
    };
    if (!prompt) throw new Error('Prompt is required');

    const creditsRequired = 50;
    const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
    if (!profile || profile.credits < creditsRequired)
      throw new Error(`Insufficient credits. Required: ${creditsRequired}, Available: ${profile?.credits ?? 0}`);

    const stylePrompts: Record<string, string> = {
      photorealistic: 'Ultra high resolution, photorealistic, professional photography style',
      artistic: 'Artistic, painterly style with expressive brushstrokes',
      anime: 'Anime style, Japanese animation aesthetic',
      '3d': '3D rendered, high quality CGI, cinematic lighting',
    };
    const enhancedPrompt = style && style !== 'none' ? `${prompt}. ${stylePrompts[style] || ''}` : prompt;

    let imageBytes: Uint8Array;

    if (sourceImageUrl) {
      // Edit endpoint — send reference image as multipart
      const imgRes = await fetch(sourceImageUrl);
      if (!imgRes.ok) throw new Error('Failed to download reference image');
      const imgBuf = await imgRes.arrayBuffer();
      const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';

      const formData = new FormData();
      formData.append('model', 'gpt-image-1');
      formData.append('prompt', enhancedPrompt);
      formData.append('n', '1');
      formData.append('size', '1024x1024');
      formData.append('image', new Blob([imgBuf], { type: mimeType }), 'reference.png');

      const editRes = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.OPENAI_API_KEY}` },
        body: formData,
      });

      if (!editRes.ok) {
        const err = await editRes.text();
        if (editRes.status === 429) throw new Error('Rate limit exceeded. Try again later.');
        throw new Error(`Image generation failed: ${editRes.status} - ${err}`);
      }

      const editData = await editRes.json() as any;
      const b64 = editData.data?.[0]?.b64_json;
      if (!b64) throw new Error('No image returned from OpenAI');
      imageBytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    } else {
      // Generation endpoint
      const genRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: enhancedPrompt,
          n: 1,
          size: '1024x1024',
        }),
      });

      if (!genRes.ok) {
        const err = await genRes.text();
        if (genRes.status === 429) throw new Error('Rate limit exceeded. Try again later.');
        throw new Error(`Image generation failed: ${genRes.status} - ${err}`);
      }

      const genData = await genRes.json() as any;
      const b64 = genData.data?.[0]?.b64_json;
      if (!b64) throw new Error('No image returned from OpenAI');
      imageBytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    }

    const filename = `${user.id}/${Date.now()}-${crypto.randomUUID()}.png`;
    const { error: uploadError } = await supabase.storage
      .from('generations')
      .upload(filename, imageBytes, { contentType: 'image/png', upsert: false });
    if (uploadError) throw new Error('Failed to save image');

    const { data: urlData } = supabase.storage.from('generations').getPublicUrl(filename);
    const resultImageUrl = urlData.publicUrl;

    const { data: generation } = await supabase
      .from('generations')
      .insert({ user_id: user.id, type: 'image', prompt, settings: { style }, status: 'completed', result_url: resultImageUrl, credits_used: creditsRequired })
      .select().single();

    await supabase.from('profiles').update({ credits: profile.credits - creditsRequired }).eq('id', user.id);

    return jsonResponse({ success: true, imageUrl: resultImageUrl, generationId: generation?.id, creditsUsed: creditsRequired });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 400);
  }
};

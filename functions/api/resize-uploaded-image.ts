import { corsResponse, jsonResponse } from '../_shared/cors';
import { adminClient, type Env } from '../_shared/auth';

const VIDEO_SIZES = {
  '16:9': { width: 1280, height: 720 },
  '9:16': { width: 720, height: 1280 },
};

export const onRequestOptions: PagesFunction = async () => corsResponse();

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { imageUrl, userId } = await request.json() as { imageUrl: string; userId?: string };
    if (!imageUrl) throw new Error('imageUrl is required');

    const supabase = adminClient(env);
    const resizedImages: Record<string, string> = {};

    for (const [aspectRatio, { width, height }] of Object.entries(VIDEO_SIZES)) {
      try {
        const response = await fetch(imageUrl, {
          cf: { image: { width, height, fit: 'cover', format: 'jpeg' } },
        } as RequestInit & { cf?: Record<string, unknown> });

        if (!response.ok) continue;

        const bytes = new Uint8Array(await response.arrayBuffer());
        const randomId = Math.random().toString(36).substring(7);
        const aspectRatioSafe = aspectRatio.replace(':', '-');
        const filePath = `video-references/${userId || 'anonymous'}/${Date.now()}-${randomId}-${aspectRatioSafe}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('generations')
          .upload(filePath, bytes, { contentType: 'image/jpeg', upsert: true });

        if (uploadError) continue;

        const { data: { publicUrl } } = supabase.storage.from('generations').getPublicUrl(filePath);
        resizedImages[aspectRatio] = publicUrl;
      } catch {
        continue;
      }
    }

    return jsonResponse({
      success: true, resizedImages,
      message: `Created ${Object.keys(resizedImages).length} video formats`,
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
};

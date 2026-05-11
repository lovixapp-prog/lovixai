import { corsResponse, jsonResponse } from '../_shared/cors';
import { adminClient, type Env } from '../_shared/auth';

const VIDEO_SIZES = {
  '16:9': { width: 1280, height: 720 },
  '9:16': { width: 720, height: 1280 },
};

// Resize via Cloudflare Image Resizing (available on CF Pages/Workers)
async function resizeViaCloudflare(imageUrl: string, width: number, height: number): Promise<Uint8Array | null> {
  try {
    const response = await fetch(imageUrl, {
      cf: {
        image: { width, height, fit: 'cover', format: 'jpeg' },
      },
    } as RequestInit & { cf?: Record<string, unknown> });

    if (!response.ok) return null;
    return new Uint8Array(await response.arrayBuffer());
  } catch {
    return null;
  }
}

export const onRequestOptions: PagesFunction = async () => corsResponse();

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { imageUrl, poseId, userId } = await request.json() as {
      imageUrl: string;
      poseId: string;
      userId: string;
    };

    if (!imageUrl || !poseId || !userId) {
      return jsonResponse({ error: 'Missing required parameters: imageUrl, poseId, userId' }, 400);
    }

    const supabase = adminClient(env);
    const results: Record<string, string> = {};

    await Promise.all(
      Object.entries(VIDEO_SIZES).map(async ([aspectRatio, { width, height }]) => {
        const resizedBytes = await resizeViaCloudflare(imageUrl, width, height);
        if (!resizedBytes) return;

        const fileName = `${userId}/poses/${poseId}_${aspectRatio.replace(':', 'x')}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('generations')
          .upload(fileName, resizedBytes, { contentType: 'image/jpeg', upsert: true });

        if (uploadError) return;

        const { data: urlData } = supabase.storage.from('generations').getPublicUrl(fileName);
        results[aspectRatio] = urlData.publicUrl;
      })
    );

    const updateData: Record<string, string> = {};
    if (results['16:9']) updateData.image_url_16_9 = results['16:9'];
    if (results['9:16']) updateData.image_url_9_16 = results['9:16'];

    if (Object.keys(updateData).length > 0) {
      await supabase.from('influencer_poses').update(updateData).eq('id', poseId).eq('user_id', userId);
    }

    return jsonResponse({
      success: true, poseId, resizedImages: results,
      message: `Created ${Object.keys(results).length} video formats`,
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ error: msg }, 500);
  }
};

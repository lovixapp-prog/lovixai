import { corsResponse, jsonResponse } from '../_shared/cors';
import { getUser, adminClient, type Env } from '../_shared/auth';

export const onRequestOptions: PagesFunction = async () => corsResponse();

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { user } = await getUser(request, env);

    const { url } = await request.json() as { url: string };
    if (!url) throw new Error('url is required');

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LovixBot/1.0)' },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);

    const html = await res.text();

    const meta = (prop: string): string => {
      const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'))
        || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i'));
      return m?.[1]?.trim() ?? '';
    };

    const title = meta('og:title') || meta('twitter:title')
      || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || '';

    const description = meta('og:description') || meta('twitter:description')
      || meta('description') || '';

    const rawImageUrl = meta('og:image') || meta('twitter:image') || '';

    const priceMatch = html.match(/(?:[$€£¥])\s*(\d[\d,]*(?:\.\d{1,2})?)/);
    const price = priceMatch ? priceMatch[0].replace(/\s/g, '') : '';

    // Upload scraped image to Supabase storage so Kling always gets a stable URL
    let imageUrl = rawImageUrl;
    if (rawImageUrl) {
      try {
        const imgRes = await fetch(rawImageUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LovixBot/1.0)' },
        });
        if (imgRes.ok) {
          const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
          const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
          const imgBuf = await imgRes.arrayBuffer();
          const filename = `${user.id}/ugc-product-images/${Date.now()}.${ext}`;
          const admin = adminClient(env);
          const { error: uploadErr } = await admin.storage
            .from('generations')
            .upload(filename, imgBuf, { contentType, upsert: false });
          if (!uploadErr) {
            imageUrl = admin.storage.from('generations').getPublicUrl(filename).data.publicUrl;
          }
        }
      } catch { /* fallback to original URL */ }
    }

    return jsonResponse({
      success: true,
      title: title.substring(0, 120),
      description: description.substring(0, 500),
      imageUrl,
      price,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 400);
  }
};

import { corsResponse, jsonResponse } from '../_shared/cors';
import { adminClient, type Env } from '../_shared/auth';

export const onRequestOptions: PagesFunction = async () => corsResponse();

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { event_type = 'install', platform = 'win', version = 'unknown' } =
      await request.json() as { event_type?: string; platform?: string; version?: string };

    const supabase = adminClient(env);
    await supabase.from('app_events').insert({ event_type, platform, version });
  } catch { /* silent — never error to Electron */ }

  return jsonResponse({ ok: true });
};

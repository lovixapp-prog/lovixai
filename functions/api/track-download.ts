import { adminClient, type Env } from '../_shared/auth';

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } });

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const platform = url.searchParams.get('platform') || 'win';

  try {
    const supabase = adminClient(env);
    await supabase.from('app_events').insert({ event_type: 'download', platform });
  } catch { /* silent */ }

  const filename = platform === 'mac' ? 'Lovix-AI.dmg' : 'Lovix-AI-Setup.exe';
  return Response.redirect(
    `https://github.com/enricomo89/lovix-desktop/releases/latest/download/${filename}`,
    302
  );
};

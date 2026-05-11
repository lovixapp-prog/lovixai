import { corsResponse, jsonResponse } from '../_shared/cors';
import { getUser, adminClient, type Env } from '../_shared/auth';

function firstName(name: string | undefined, fallback: string) {
  const trimmed = name?.trim();
  return trimmed ? trimmed.split(/\s+/)[0] : fallback;
}

function buildWelcomeEmailHtml(name: string) {
  const displayName = firstName(name, 'Creator');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome to LOVIX</title>
  </head>
  <body style="margin:0;padding:0;background:#070708;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#070708;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;">
            <tr>
              <td align="center" style="padding:0 0 24px;">
                <img src="https://lovix.app/logo.svg" alt="LOVIX" width="64" height="64" style="display:block;border-radius:18px;">
                <div style="font-size:20px;font-weight:800;letter-spacing:4px;margin-top:12px;">LOVIX</div>
              </td>
            </tr>
            <tr>
              <td style="background:#111114;border:1px solid rgba(249,115,22,.28);border-radius:24px;padding:42px 36px;text-align:center;">
                <h1 style="margin:0 0 12px;font-size:32px;line-height:1.2;color:#ffffff;">Welcome, ${displayName}.</h1>
                <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:rgba(255,255,255,.68);">
                  Your AI creative studio is ready. Generate images, videos, UGC ads, and AI influencer content from one dashboard.
                </p>
                <a href="https://lovix.app/dashboard" style="display:inline-block;background:#f97316;color:#120804;text-decoration:none;font-size:15px;font-weight:800;padding:15px 32px;border-radius:14px;">
                  Start creating
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 0 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#101013;border:1px solid rgba(255,255,255,.08);border-radius:18px;">
                  <tr>
                    <td align="center" style="padding:26px 28px;">
                      <div style="font-size:48px;font-weight:900;color:#f97316;line-height:1;">150</div>
                      <div style="font-size:16px;font-weight:800;margin-top:6px;">Free credits are ready</div>
                      <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:rgba(255,255,255,.55);">
                        Use them to try LOVIX image, video, motion, and influencer tools.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:26px 0 0;color:rgba(255,255,255,.32);font-size:12px;line-height:1.6;">
                LOVIX - lovix.app<br>
                You received this because you created a LOVIX account.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export const onRequestOptions: PagesFunction = async () => corsResponse();

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured');

    const { user } = await getUser(request, env);
    if (!user.email) throw new Error('User has no email address');

    const body = await request.json().catch(() => ({})) as { name?: string };
    const profileName = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : '';
    const targetName = body.name?.trim() || profileName;

    const supabase = adminClient(env);
    const { data: profile } = await supabase
      .from('profiles')
      .select('welcome_email_sent')
      .eq('id', user.id)
      .single();

    if (profile?.welcome_email_sent) {
      return jsonResponse({ success: true, skipped: true, reason: 'already_sent' });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LOVIX <noreply@lovix.app>',
        to: user.email,
        subject: `Welcome to LOVIX, ${firstName(targetName, 'Creator')}!`,
        html: buildWelcomeEmailHtml(targetName),
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Resend error: ${res.status} - ${errorText.slice(0, 200)}`);
    }

    await supabase
      .from('profiles')
      .update({ welcome_email_sent: true })
      .eq('id', user.id);

    return jsonResponse({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 400);
  }
};

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function buildWelcomeEmailHtml(name: string): string {
  const displayName = name ? name.split(' ')[0] : 'Creator';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Welcome to LOVIX</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;-webkit-text-size-adjust:100%;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#0a0a0f;min-height:100vh;">
  <tr>
    <td align="center" style="padding:32px 16px 48px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td align="center" style="padding:0 0 32px;">
            <img src="https://lovix.app/logo.png" alt="LOVIX" width="60" height="60"
              style="display:block;border-radius:16px;margin:0 auto 12px;" />
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:20px;font-weight:900;color:#ffffff;letter-spacing:4px;text-transform:uppercase;">LOVIX</div>
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:2px;margin-top:4px;text-transform:uppercase;">AI Creative Platform</div>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="background:linear-gradient(145deg,#180a30 0%,#0d0d1f 45%,#071a20 100%);border-radius:24px;padding:52px 44px 48px;text-align:center;border:1px solid rgba(124,58,237,0.3);">
            <div style="display:inline-block;background:linear-gradient(90deg,#7c3aed,#f97316,#06b6d4);border-radius:3px;height:4px;width:64px;margin-bottom:28px;font-size:0;">&nbsp;</div>
            <h1 style="margin:0 0 14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:34px;font-weight:900;color:#ffffff;line-height:1.2;letter-spacing:-0.5px;">
              Welcome, ${displayName}! 🎨
            </h1>
            <p style="margin:0 0 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:17px;color:rgba(255,255,255,0.65);line-height:1.7;">
              Your AI creative studio is ready.<br>Generate images, videos &amp; AI influencers in seconds.
            </p>
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto;">
              <tr>
                <td style="border-radius:14px;background:linear-gradient(135deg,#f97316 0%,#dc6309 100%);">
                  <a href="https://lovix.app/dashboard"
                    style="display:inline-block;padding:18px 52px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px;border-radius:14px;">
                    Start Creating Now →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CREDITS BOX -->
        <tr>
          <td style="padding:24px 0 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
              <tr>
                <td style="background:linear-gradient(135deg,rgba(124,58,237,0.2) 0%,rgba(6,182,212,0.12) 100%);border:1px solid rgba(124,58,237,0.35);border-radius:20px;padding:32px 36px;text-align:center;">
                  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:64px;font-weight:900;color:#a78bfa;line-height:1;margin-bottom:6px;">150</div>
                  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:18px;font-weight:800;color:#ffffff;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Free Credits</div>
                  <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;color:rgba(255,255,255,0.5);margin:0 0 22px;line-height:1.6;">
                    Your welcome gift is already in your account.<br>Use them to generate AI images, videos &amp; more.
                  </p>
                  <a href="https://lovix.app/dashboard"
                    style="display:inline-block;padding:12px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:700;color:#a78bfa;text-decoration:none;border:1.5px solid rgba(124,58,237,0.5);border-radius:10px;letter-spacing:0.3px;">
                    Claim Your Credits →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FEATURES -->
        <tr>
          <td style="padding:24px 0 0;">
            <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;font-weight:700;color:rgba(255,255,255,0.25);letter-spacing:2px;text-align:center;text-transform:uppercase;margin:0 0 16px;">What you can create</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
              <tr>
                <td width="33%" style="padding:0 6px;vertical-align:top;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td style="background:#13131f;border:1px solid rgba(124,58,237,0.15);border-radius:16px;padding:22px 16px;text-align:center;">
                        <div style="font-size:32px;margin-bottom:10px;line-height:1;">🎨</div>
                        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:700;color:#ffffff;margin-bottom:6px;">AI Images</div>
                        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;color:rgba(255,255,255,0.4);line-height:1.5;">Powered by GPT-image-1</div>
                      </td>
                    </tr>
                  </table>
                </td>
                <td width="33%" style="padding:0 6px;vertical-align:top;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td style="background:#13131f;border:1px solid rgba(249,115,22,0.15);border-radius:16px;padding:22px 16px;text-align:center;">
                        <div style="font-size:32px;margin-bottom:10px;line-height:1;">🎬</div>
                        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:700;color:#ffffff;margin-bottom:6px;">AI Videos</div>
                        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;color:rgba(255,255,255,0.4);line-height:1.5;">Kling v2.6 motion AI</div>
                      </td>
                    </tr>
                  </table>
                </td>
                <td width="33%" style="padding:0 6px;vertical-align:top;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td style="background:#13131f;border:1px solid rgba(6,182,212,0.15);border-radius:16px;padding:22px 16px;text-align:center;">
                        <div style="font-size:32px;margin-bottom:10px;line-height:1;">🤖</div>
                        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:700;color:#ffffff;margin-bottom:6px;">AI Influencer</div>
                        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;color:rgba(255,255,255,0.4);line-height:1.5;">Custom AI personas</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MOTION SECTION -->
        <tr>
          <td style="padding:20px 0 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
              <tr>
                <td style="background:linear-gradient(135deg,rgba(249,115,22,0.1),rgba(124,58,237,0.1));border:1px solid rgba(249,115,22,0.2);border-radius:16px;padding:28px 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td style="vertical-align:middle;">
                        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;font-weight:700;color:#f97316;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;">NEW ✦</div>
                        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:18px;font-weight:800;color:#ffffff;margin-bottom:8px;">Motion Transfer &amp; Lip-Sync</div>
                        <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;color:rgba(255,255,255,0.5);margin:0 0 18px;line-height:1.6;">
                          Animate any image or make it talk with AI-powered motion control.
                        </p>
                        <a href="https://lovix.app/dashboard"
                          style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:600;color:#f97316;text-decoration:none;">
                          Try Motion →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- DIVIDER -->
        <tr>
          <td style="padding:32px 0 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
              <tr><td style="border-top:1px solid rgba(255,255,255,0.06);font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="text-align:center;">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 16px;">
              <tr>
                <td style="padding:0 10px;"><a href="https://lovix.app" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;color:rgba(255,255,255,0.3);text-decoration:none;">Website</a></td>
                <td style="padding:0 8px;color:rgba(255,255,255,0.12);font-size:12px;">·</td>
                <td style="padding:0 10px;"><a href="https://lovix.app/dashboard" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;color:rgba(255,255,255,0.3);text-decoration:none;">Dashboard</a></td>
                <td style="padding:0 8px;color:rgba(255,255,255,0.12);font-size:12px;">·</td>
                <td style="padding:0 10px;"><a href="https://lovix.app/privacy" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;color:rgba(255,255,255,0.3);text-decoration:none;">Privacy</a></td>
              </tr>
            </table>
            <p style="margin:0 0 6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;color:rgba(255,255,255,0.18);">© 2026 LOVIX — lovix.app</p>
            <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;color:rgba(255,255,255,0.12);">
              You received this because you created a LOVIX account.
              <a href="https://lovix.app/unsubscribe" style="color:rgba(255,255,255,0.2);text-decoration:underline;">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) throw new Error('RESEND_API_KEY not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    // Determine if called by service_role (admin) or by the user JWT
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');

    let targetEmail = '';
    let targetName = '';
    let targetUserId = '';

    // Check token type
    let jwtRole = '';
    try { jwtRole = JSON.parse(atob(token.split('.')[1])).role ?? ''; } catch { /* */ }

    if (jwtRole === 'service_role') {
      // Admin call: must provide userId or email directly
      const body = await req.json();
      const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      if (body.userId) {
        const { data: { user } } = await adminSupabase.auth.admin.getUserById(body.userId);
        if (!user?.email) throw new Error('User not found or has no email');
        targetEmail = user.email;
        targetName = user.user_metadata?.full_name ?? '';
        targetUserId = user.id;
      } else if (body.email) {
        targetEmail = body.email;
        targetName = body.name ?? '';
      }
    } else {
      // User JWT call: get user from their session
      const userSupabase = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false, autoRefreshToken: false }
      });
      const { data: { user }, error: authError } = await userSupabase.auth.getUser();
      if (authError || !user?.email) throw new Error('Authentication required');
      targetEmail = user.email;
      targetName = (await req.json().catch(() => ({}))).name ?? user.user_metadata?.full_name ?? '';
      targetUserId = user.id;
    }

    if (!targetEmail) throw new Error('Email not found');

    // Check if welcome email already sent (only if we have userId)
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    if (targetUserId) {
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('welcome_email_sent')
        .eq('id', targetUserId)
        .single();
      if (profile?.welcome_email_sent) {
        return new Response(JSON.stringify({ success: true, skipped: true, reason: 'already_sent' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const html = buildWelcomeEmailHtml(targetName);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LOVIX <noreply@lovix.app>',
        to: targetEmail,
        subject: `Welcome to LOVIX, ${targetName ? targetName.split(' ')[0] : 'Creator'}! Your 150 free credits are ready 🎨`,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Resend error: ${res.status} — ${errText.substring(0, 200)}`);
    }

    // Mark as sent
    if (targetUserId) {
      await adminSupabase
        .from('profiles')
        .update({ welcome_email_sent: true })
        .eq('id', targetUserId);
    }

    console.log(`Welcome email sent to ${targetEmail}`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('send-welcome-email error:', msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

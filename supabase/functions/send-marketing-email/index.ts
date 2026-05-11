import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Audience = 'all' | 'active' | 'inactive' | 'custom';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    let jwtRole = '';
    try { jwtRole = JSON.parse(atob(token.split('.')[1])).role ?? ''; } catch { /* */ }
    if (jwtRole !== 'service_role') {
      return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) throw new Error('RESEND_API_KEY not configured in Supabase secrets');

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });

    const { subject, html, audience = 'all', previewText = '', templateType = 'custom', customEmails = [] }: {
      subject: string;
      html: string;
      audience: Audience;
      previewText?: string;
      templateType?: string;
      customEmails?: string[];
    } = await req.json();

    if (!subject || !html) throw new Error('subject and html are required');

    // Load unsubscribed emails for filtering
    const { data: unsubData } = await supabase
      .from('email_unsubscribes')
      .select('email');
    const unsubscribed = new Set((unsubData ?? []).map((r: { email: string }) => r.email.toLowerCase()));

    let targetEmails: string[] = [];

    if (audience === 'custom') {
      // Use explicitly provided email list
      targetEmails = customEmails.filter(e => e && e.includes('@'));
    } else {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (usersError) throw new Error('Failed to fetch users: ' + usersError.message);

      if (audience === 'all') {
        targetEmails = users.filter(u => u.email).map(u => u.email!);
      } else if (audience === 'active') {
        const { data: recentGens } = await supabase.from('generations').select('user_id').gte('created_at', thirtyDaysAgo);
        const activeIds = new Set((recentGens ?? []).map((g: { user_id: string }) => g.user_id));
        targetEmails = users.filter(u => u.email && activeIds.has(u.id)).map(u => u.email!);
      } else if (audience === 'inactive') {
        const [{ data: recentGens }, { data: everGens }] = await Promise.all([
          supabase.from('generations').select('user_id').gte('created_at', thirtyDaysAgo),
          supabase.from('generations').select('user_id'),
        ]);
        const recentIds = new Set((recentGens ?? []).map((g: { user_id: string }) => g.user_id));
        const everIds = new Set((everGens ?? []).map((g: { user_id: string }) => g.user_id));
        targetEmails = users
          .filter(u => u.email && everIds.has(u.id) && !recentIds.has(u.id))
          .map(u => u.email!);
      }
    }

    // Filter out unsubscribed
    targetEmails = targetEmails.filter(e => !unsubscribed.has(e.toLowerCase()));

    if (targetEmails.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, failed: 0, total: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepend preview text hidden div
    const finalHtml = previewText
      ? html.replace(
          /<body[^>]*>/,
          (m) => `${m}<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}</div>`
        )
      : html;

    // Send via Resend batch API (max 100 per batch)
    const BATCH_SIZE = 100;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < targetEmails.length; i += BATCH_SIZE) {
      const batch = targetEmails.slice(i, i + BATCH_SIZE);
      const emails = batch.map(to => ({
        from: 'LOVIX <noreply@lovix.app>',
        to,
        subject,
        html: finalHtml,
      }));

      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(emails),
      });

      if (res.ok) {
        sent += batch.length;
      } else {
        const errText = await res.text();
        console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, res.status, errText.substring(0, 200));
        failed += batch.length;
      }
    }

    // Log campaign to DB
    await supabase.from('email_campaigns').insert({
      subject,
      preview_text: previewText,
      template_type: templateType,
      audience,
      recipient_count: targetEmails.length,
      sent_count: sent,
      failed_count: failed,
    });

    console.log(`Marketing email sent: ${sent} ok, ${failed} failed, audience: ${audience}`);

    return new Response(JSON.stringify({
      success: true,
      sent,
      failed,
      total: targetEmails.length,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('send-marketing-email error:', errorMessage);
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

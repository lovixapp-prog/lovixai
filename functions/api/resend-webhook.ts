import { jsonResponse } from '../_shared/cors';
import { adminClient, type Env } from '../_shared/auth';

async function verifySvixSignature(body: string, headers: Headers, secret: string): Promise<boolean> {
  const msgId = headers.get('svix-id');
  const msgTimestamp = headers.get('svix-timestamp');
  const msgSignature = headers.get('svix-signature');
  if (!msgId || !msgTimestamp || !msgSignature) return false;

  const ts = parseInt(msgTimestamp, 10);
  if (Math.abs(Math.floor(Date.now() / 1000) - ts) > 300) return false;

  const toSign = `${msgId}.${msgTimestamp}.${body}`;
  const secretBase64 = secret.replace('whsec_', '');
  const secretBytes = Uint8Array.from(atob(secretBase64), c => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    'raw', secretBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(toSign));
  const computed = 'v1,' + btoa(String.fromCharCode(...new Uint8Array(sigBytes)));

  return msgSignature.split(' ').includes(computed);
}

const EVENT_MAP: Record<string, string> = {
  'email.sent': 'sent',
  'email.delivered': 'delivered',
  'email.delivery_delayed': 'delayed',
  'email.opened': 'open',
  'email.clicked': 'click',
  'email.bounced': 'bounce',
  'email.complained': 'complaint',
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.text();
  const secret = env.RESEND_WEBHOOK_SECRET;

  if (secret) {
    const valid = await verifySvixSignature(body, request.headers, secret);
    if (!valid) return jsonResponse({ error: 'Invalid signature' }, 401);
  }

  let payload: { type: string; created_at: string; data: Record<string, unknown> };
  try {
    payload = JSON.parse(body);
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const eventType = EVENT_MAP[payload.type];
  if (!eventType) return jsonResponse({ received: true, skipped: true });

  const supabase = adminClient(env);
  const data = payload.data ?? {};

  const toArr = data.to as string[] | string | undefined;
  const email = Array.isArray(toArr) ? toArr[0] : (toArr ?? '');

  // Insert event
  await supabase.from('email_events').insert({
    event_type: eventType,
    email: email.toLowerCase(),
    metadata: data,
  });

  // Auto-unsubscribe on hard bounce or complaint
  if (eventType === 'bounce' || eventType === 'complaint') {
    const bounceData = data.bounce as { bounceType?: string } | undefined;
    const isHard = eventType === 'complaint' || bounceData?.bounceType === 'HardBounce';
    if (isHard && email) {
      await supabase.from('email_unsubscribes').upsert(
        { email: email.toLowerCase(), source: eventType === 'complaint' ? 'complaint' : 'bounce' },
        { onConflict: 'email', ignoreDuplicates: true }
      );
    }
  }

  return jsonResponse({ received: true });
};

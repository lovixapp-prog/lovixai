import { jsonResponse } from '../_shared/cors';
import { adminClient, type Env } from '../_shared/auth';
import Stripe from 'stripe';

const CREDITS_BY_PRICE: Record<string, number> = {
  'price_1TUAtjHOyxlmJSTGu6g7oSwR': 660,
  'price_1TUAtkHOyxlmJSTGnGPrzPA0': 3000,
  'price_1TUAtkHOyxlmJSTGlTi8J4Wv': 8000,
  'price_1TUAtlHOyxlmJSTGrSzfZpzp': 26000,
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const sig = request.headers.get('stripe-signature');
  if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
    return jsonResponse({ error: 'Missing signature or webhook secret' }, 400);
  }

  const body = await request.text();
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-08-27.basil' as any });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return jsonResponse({ error: `Webhook verification failed: ${err}` }, 400);
  }

  const supabase = adminClient(env);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    if (!userId) return jsonResponse({ received: true });

    const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
    const priceId = items.data[0]?.price?.id;
    const credits = priceId ? (CREDITS_BY_PRICE[priceId] ?? 0) : 0;

    if (credits > 0) {
      await supabase.rpc('add_credits', { p_user_id: userId, p_amount: credits });
    }
  }

  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice;
    if (invoice.billing_reason !== 'subscription_cycle') return jsonResponse({ received: true });

    const priceId = invoice.lines.data[0]?.price?.id;
    const credits = priceId ? (CREDITS_BY_PRICE[priceId] ?? 0) : 0;
    if (credits === 0) return jsonResponse({ received: true });

    const customer = await stripe.customers.retrieve(invoice.customer as string);
    const email = (customer as Stripe.Customer).email;
    if (!email) return jsonResponse({ received: true });

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profile?.id) {
      await supabase.rpc('add_credits', { p_user_id: profile.id, p_amount: credits });
    }
  }

  return jsonResponse({ received: true });
};

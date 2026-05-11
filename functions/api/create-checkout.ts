import { corsResponse, jsonResponse } from '../_shared/cors';
import { getUser, type Env } from '../_shared/auth';
import Stripe from 'stripe';

export const onRequestOptions: PagesFunction = async () => corsResponse();

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');

    const { user } = await getUser(request, env);
    if (!user.email) throw new Error('User email not available');

    const { priceId, mode } = await request.json() as { priceId: string; mode: string };

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-08-27.basil' as any });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = request.headers.get('origin') || 'https://lovix.app';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode as Stripe.Checkout.SessionCreateParams.Mode,
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: { user_id: user.id },
    });

    return jsonResponse({ url: session.url });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return jsonResponse({ error: msg }, 500);
  }
};

import { corsResponse, jsonResponse } from '../_shared/cors';
import { getUser, type Env } from '../_shared/auth';
import Stripe from 'stripe';

const planMapping: Record<string, string> = {
  'price_1TUAtjHOyxlmJSTGu6g7oSwR': 'Standard',
  'price_1TUAtkHOyxlmJSTGnGPrzPA0': 'Pro',
  'price_1TUAtkHOyxlmJSTGlTi8J4Wv': 'Premier',
  'price_1TUAtlHOyxlmJSTGrSzfZpzp': 'Ultra',
};

export const onRequestOptions: PagesFunction = async () => corsResponse();

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');

    const { user } = await getUser(request, env);
    if (!user.email) throw new Error('User email not available');

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-08-27.basil' as any });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      return jsonResponse({ subscribed: false, plan: null, subscription_end: null });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 1 });
    const hasActiveSub = subscriptions.data.length > 0;

    if (!hasActiveSub) {
      return jsonResponse({ subscribed: false, plan: null, subscription_end: null });
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    const planName = planMapping[priceId] || 'Active Plan';
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

    return jsonResponse({
      subscribed: true,
      product_id: subscription.items.data[0].price.product,
      price_id: priceId,
      plan: planName,
      subscription_end: subscriptionEnd,
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return jsonResponse({ error: msg }, 500);
  }
};

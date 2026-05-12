import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_ANON_KEY: string;
  OPENAI_API_KEY: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_CHAT_MODEL?: string;
  OPENROUTER_PLAN_MODEL?: string;
  GOOGLE_AI_STUDIO_API_KEY?: string;
  KLING_ACCESS_KEY: string;
  KLING_SECRET_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  RESEND_API_KEY?: string;
  RESEND_WEBHOOK_SECRET?: string;
}

export function adminClient(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function getUser(request: Request, env: Env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) throw new Error('No authorization header');

  const token = authHeader.replace('Bearer ', '');
  const supabase = adminClient(env);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new Error('Unauthorized: ' + (error?.message || 'No user found'));

  return { user, supabase };
}

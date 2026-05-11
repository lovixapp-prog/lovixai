import { supabase } from '@/integrations/supabase/client';

export async function callAPI<T = unknown>(path: string, body: object): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let errMsg = `API error ${res.status}`;
    try {
      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const d = await res.json();
        errMsg = d?.error ?? errMsg;
      }
    } catch { /* ignore parse errors */ }
    throw new Error(errMsg);
  }

  try {
    return await res.json() as T;
  } catch {
    throw new Error('Invalid API response — endpoint may not be available');
  }
}

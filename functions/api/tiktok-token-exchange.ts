import { corsResponse, jsonResponse } from '../_shared/cors';

interface Env {
  TIKTOK_CLIENT_KEY: string;
  TIKTOK_CLIENT_SECRET: string;
}

export const onRequestOptions: PagesFunction = async () => corsResponse();

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { code, redirect_uri, code_verifier } = await request.json() as {
      code: string;
      redirect_uri: string;
      code_verifier?: string;
    };

    if (!code) return jsonResponse({ error: 'Missing authorization code' }, 400);
    if (!redirect_uri) return jsonResponse({ error: 'Missing redirect_uri parameter' }, 400);

    if (!env.TIKTOK_CLIENT_KEY || !env.TIKTOK_CLIENT_SECRET) {
      return jsonResponse({ error: 'Server configuration error' }, 500);
    }

    const tokenParams: Record<string, string> = {
      client_key: env.TIKTOK_CLIENT_KEY,
      client_secret: env.TIKTOK_CLIENT_SECRET,
      code, grant_type: 'authorization_code', redirect_uri,
    };
    if (code_verifier) tokenParams.code_verifier = code_verifier;

    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(tokenParams).toString(),
    });

    const tokenData = await tokenResponse.json() as any;

    if (!tokenResponse.ok || tokenData.error) {
      return jsonResponse({
        error: tokenData.error || 'Token exchange failed',
        error_description: tokenData.error_description || 'Unknown error',
      }, 400);
    }

    return jsonResponse({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      open_id: tokenData.open_id,
      scope: tokenData.scope,
      expires_in: tokenData.expires_in,
      refresh_expires_in: tokenData.refresh_expires_in,
      token_type: tokenData.token_type,
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ error: 'Internal server error', details: msg }, 500);
  }
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, redirect_uri, code_verifier } = await req.json();

    if (!code) {
      console.error('Missing authorization code');
      return new Response(
        JSON.stringify({ error: 'Missing authorization code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY');
    const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET');

    if (!clientKey || !clientSecret) {
      console.error('Missing TikTok credentials');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate redirect_uri - must match the expected production domain
    const expectedRedirectUri = "https://lovix.app/tiktok/callback/";
    
    if (!redirect_uri) {
      console.error('Missing redirect_uri');
      return new Response(
        JSON.stringify({ error: 'Missing redirect_uri parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Warn if redirect_uri doesn't match expected (but still proceed)
    if (redirect_uri !== expectedRedirectUri) {
      console.warn(`redirect_uri mismatch! Expected: ${expectedRedirectUri}, Got: ${redirect_uri}`);
    }

    console.log('=== TikTok Token Exchange ===');
    console.log('Redirect URI received:', redirect_uri);
    console.log('Code length:', code.length);
    console.log('Code verifier provided:', code_verifier ? 'Yes' : 'No');

    // Build token request body
    const tokenParams: Record<string, string> = {
      client_key: clientKey,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirect_uri,
    };

    // Include code_verifier if provided (for PKCE flow)
    if (code_verifier) {
      tokenParams.code_verifier = code_verifier;
      console.log('Including code_verifier in token request');
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenParams).toString(),
    });

    const tokenData = await tokenResponse.json();
    console.log('TikTok token response status:', tokenResponse.status);
    
    if (!tokenResponse.ok || tokenData.error) {
      console.error('TikTok token exchange failed:', JSON.stringify(tokenData));
      console.error('Error:', tokenData.error);
      console.error('Error description:', tokenData.error_description);
      return new Response(
        JSON.stringify({ 
          error: tokenData.error || 'Token exchange failed',
          error_description: tokenData.error_description || 'Unknown error'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('TikTok token exchange successful!');
    console.log('Open ID:', tokenData.open_id);
    console.log('Scope:', tokenData.scope);
    
    // Return the access token data
    return new Response(
      JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        open_id: tokenData.open_id,
        scope: tokenData.scope,
        expires_in: tokenData.expires_in,
        refresh_expires_in: tokenData.refresh_expires_in,
        token_type: tokenData.token_type,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in TikTok token exchange:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate JWT token for Kling API authentication
async function generateKlingJWT(accessKey: string, secretKey: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: accessKey,
    exp: now + 1800, // 30 minutes expiration
    nbf: now - 5,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64Encode(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const payloadB64 = base64Encode(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  const data = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const signatureArray = new Uint8Array(signature);
  const signatureB64 = base64Encode(signatureArray.buffer).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  return `${data}.${signatureB64}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const klingAccessKey = Deno.env.get('KLING_ACCESS_KEY');
    const klingSecretKey = Deno.env.get('KLING_SECRET_KEY');
    
    if (!klingAccessKey || !klingSecretKey) {
      throw new Error('KLING_ACCESS_KEY or KLING_SECRET_KEY is not configured');
    }
    
    // Generate JWT token
    const klingToken = await generateKlingJWT(klingAccessKey, klingSecretKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    // Admin client for all operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized: ' + (authError?.message || 'No user found'));
    }

    const { generationId } = await req.json();

    if (!generationId) {
      throw new Error('Generation ID is required');
    }

    // Get generation record
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', user.id)
      .single();

    if (genError || !generation) {
      throw new Error('Generation not found');
    }

    if (generation.status === 'completed') {
      return new Response(JSON.stringify({
        status: 'completed',
        resultUrl: generation.result_url,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (generation.status === 'failed') {
      return new Response(JSON.stringify({
        status: 'failed',
        error: generation.error_message,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine the correct status endpoint based on motion type in settings
    const settings = generation.settings as { 
      audioUrl?: string; 
      videoUrl?: string; 
      imageUrl?: string;
      motionType?: string;
    } | null;
    
    let statusEndpoint: string;
    const motionType = settings?.motionType;
    
    console.log('Generation settings:', settings);
    console.log('Motion type:', motionType);
    
    if (motionType === 'lip-sync') {
      // Lip-sync task: GET /v1/videos/lip-sync/{id}
      statusEndpoint = `https://api.klingai.com/v1/videos/lip-sync/${generation.external_id}`;
    } else if (motionType === 'motion-control') {
      // Motion control task: GET /v1/videos/motion-control/{id}
      statusEndpoint = `https://api.klingai.com/v1/videos/motion-control/${generation.external_id}`;
    } else {
      // Image-to-video task (default): GET /v1/videos/image2video/{id}
      statusEndpoint = `https://api.klingai.com/v1/videos/image2video/${generation.external_id}`;
    }
    
    console.log('Checking status at:', statusEndpoint);

    // Poll Kling AI for status
    const response = await fetch(statusEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${klingToken}`,
      },
    });

    const responseText = await response.text();
    console.log('Kling status raw response:', response.status, responseText);

    if (!response.ok) {
      console.error('Kling status check error:', response.status, responseText);
      throw new Error(`Failed to check motion status: ${response.status} - ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Failed to parse status response: ${responseText}`);
    }
    
    console.log('Motion status parsed:', data);

    // Handle Kling API response structure
    const taskData = data.data;
    const status = taskData?.task_status || data.status;
    const works = taskData?.task_result?.videos || [];
    const videoUrl = works.length > 0 ? works[0].url : null;

    if ((status === 'succeed' || status === 'completed') && videoUrl) {
      console.log('Motion completed! Updating database with URL:', videoUrl);
      
      // Update generation record with result
      const { error: updateError } = await supabase
        .from('generations')
        .update({
          status: 'completed',
          result_url: videoUrl,
        })
        .eq('id', generationId);

      if (updateError) {
        console.error('Failed to update generation:', updateError);
        throw new Error('Failed to update generation: ' + updateError.message);
      }

      console.log('Database updated successfully');
      
      return new Response(JSON.stringify({
        status: 'completed',
        resultUrl: videoUrl,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (status === 'failed') {
      const errorMessage = taskData?.task_status_msg || data.data?.error_message || data.error_message || 'Motion generation failed';
      
      await supabase
        .from('generations')
        .update({
          status: 'failed',
          error_message: errorMessage,
        })
        .eq('id', generationId);

      return new Response(JSON.stringify({
        status: 'failed',
        error: errorMessage,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      status: 'processing',
      progress: data.data?.progress || data.progress,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in check-motion-status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      status: 'error',
      error: errorMessage,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
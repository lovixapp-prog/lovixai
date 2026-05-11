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
    console.log('Generated Kling JWT token successfully');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    // Create admin client for authentication
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized: ' + (authError?.message || 'No user found'));
    }

    // Use admin client for database operations
    const supabase = supabaseAdmin;

    const { videoUrl, imageUrl, audioUrl, characterOrientation, quality, keepOriginalSound, prompt, type } = await req.json();

    console.log('Received request:', { videoUrl, imageUrl, audioUrl, characterOrientation, quality, keepOriginalSound, prompt });

    if (!videoUrl && !imageUrl && !audioUrl) {
      throw new Error('At least one input URL must be provided');
    }

    // Standard: 150 credits, Pro: 200 credits
    const creditsRequired = quality === 'pro' ? 200 : 150;

    // Check user credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Could not fetch user profile');
    }

    if (profile.credits < creditsRequired) {
      throw new Error(`Insufficient credits. Required: ${creditsRequired}, Available: ${profile.credits}`);
    }

    let requestId: string;
    let apiEndpoint: string;
    let requestBody: any;
    let motionType: string;

    // Determine the type of motion control request
    if (audioUrl && videoUrl) {
      // Lip-sync request: apply audio to video
      apiEndpoint = 'https://api.klingai.com/v1/videos/lip-sync';
      requestBody = {
        video_url: videoUrl,
        audio_url: audioUrl,
      };
      motionType = 'lip-sync';
      console.log('Creating Kling AI lip-sync request:', requestBody);
    } else if (videoUrl && imageUrl) {
      // Motion Control: transfer motion from reference video to image
      // Official endpoint: POST /v1/videos/motion-control
      apiEndpoint = 'https://api.klingai.com/v1/videos/motion-control';

      requestBody = {
        image_url: imageUrl,
        video_url: videoUrl,
        mode: quality === 'pro' ? 'pro' : 'std',
        character_orientation: characterOrientation || 'image',
        keep_original_sound: keepOriginalSound ? 'yes' : 'no',
      };

      // Add optional prompt if provided
      if (prompt) {
        requestBody.prompt = prompt;
      }

      motionType = 'motion-control';
      console.log('Creating Kling AI motion-control request:', requestBody);
    } else if (imageUrl) {
      // Image-to-video generation (no reference video)
      apiEndpoint = 'https://api.klingai.com/v1/videos/image2video';

      requestBody = {
        model_name: 'kling-v1',
        image: imageUrl,
        mode: quality === 'pro' ? 'pro' : 'std',
        duration: '5',
      };

      // Add prompt if available
      if (prompt) {
        requestBody.prompt = prompt;
      }

      motionType = 'image2video';
      console.log('Creating Kling AI image-to-video request:', requestBody);
    } else {
      throw new Error('Invalid inputs. Provide: (videoUrl + audioUrl) for lip-sync, (videoUrl + imageUrl) for motion-control, or (imageUrl) for image-to-video.');
    }

    // Call Kling AI API
    console.log('Calling Kling AI endpoint:', apiEndpoint);
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${klingToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('Kling AI raw response:', response.status, responseText);

    if (!response.ok) {
      console.error('Kling AI error:', response.status, responseText);
      throw new Error(`Kling AI error: ${response.status} - ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Failed to parse Kling AI response: ${responseText}`);
    }
    
    console.log('Kling AI parsed response:', data);

    requestId = data.data?.task_id || data.task_id || data.id;

    if (!requestId) {
      throw new Error('No task ID returned from Kling AI: ' + JSON.stringify(data));
    }

    // Create generation record
    // Use the type from frontend if provided, otherwise default to 'motion'
    const generationType = type || 'motion';
    
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        type: generationType,
        prompt: prompt || null,
        settings: { 
          videoUrl, 
          imageUrl, 
          characterOrientation, 
          quality,
          keepOriginalSound,
          motionType,
        },
        status: 'processing',
        external_id: requestId,
        credits_used: creditsRequired,
      })
      .select()
      .single();

    if (genError) {
      console.error('Error creating generation record:', genError);
      throw new Error('Failed to create generation record');
    }

    // Deduct credits
    const { error: creditError } = await supabase
      .from('profiles')
      .update({ credits: profile.credits - creditsRequired })
      .eq('id', user.id);

    if (creditError) {
      console.error('Error deducting credits:', creditError);
    }

    console.log('Generation created successfully:', generation.id, 'Task ID:', requestId, 'Motion Type:', motionType);

    return new Response(JSON.stringify({
      success: true,
      generationId: generation.id,
      taskId: requestId,
      creditsUsed: creditsRequired,
      motionType,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in generate-motion:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
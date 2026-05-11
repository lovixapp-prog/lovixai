import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

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

    // Create user client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { prompt, seconds, aspectRatio, quality, type = 'video', referenceImageUrl } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Sanitize prompt to avoid moderation failures
    let finalPrompt = prompt;
    try {
      console.log('Sanitizing prompt before sending to Sora...');
      const sanitizeResponse = await fetch(`${supabaseUrl}/functions/v1/sanitize-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (sanitizeResponse.ok) {
        const sanitizeData = await sanitizeResponse.json();
        finalPrompt = sanitizeData.sanitizedPrompt || prompt;
        if (sanitizeData.wasModified) {
          console.log('Prompt was sanitized for compliance');
        }
      } else {
        console.warn('Sanitize function returned error, using original prompt');
      }
    } catch (sanitizeError) {
      console.warn('Failed to sanitize prompt, using original:', sanitizeError);
    }

    // Calculate credits: 150 for 4s, 300 for 8s, 450 for 12s, +50% for 4K
    const durationMultiplier = seconds === 4 ? 1 : seconds === 8 ? 2 : 3;
    const baseCost = 150 * durationMultiplier;
    const creditsRequired = quality === '4k' ? Math.round(baseCost * 1.5) : baseCost;

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

    // Map aspect ratio to Sora size format (allowed: 720x1280, 1280x720)
    const sizeMap: Record<string, string> = {
      '1:1': '1280x720', // No 1:1 in Sora, default to landscape
      '16:9': '1280x720',
      '9:16': '720x1280',
    };
    const size = sizeMap[aspectRatio] || '1280x720';

    // Map seconds to allowed values (4, 8, 12)
    const allowedSeconds = [4, 8, 12];
    const finalSeconds = allowedSeconds.includes(seconds) ? seconds : 4;

    console.log('Creating Sora video generation request:', {
      seconds: finalSeconds,
      size,
      hasReference: Boolean(referenceImageUrl),
    });

    // Create FormData for the request (Sora API uses multipart/form-data)
    const formData = new FormData();
    formData.append('model', 'sora-2');
    formData.append('prompt', finalPrompt);
    formData.append('size', size);
    formData.append('seconds', String(finalSeconds));

    // If we have a reference image URL (should be a signed URL from our storage)
    if (referenceImageUrl) {
      // Validate that the URL is from our authorized Supabase storage
      if (!referenceImageUrl.includes(supabaseUrl)) {
        console.warn('Reference URL not from authorized storage, skipping:', referenceImageUrl.substring(0, 50));
      } else {
        try {
          console.log('Downloading reference image from signed URL...');
          const imageResponse = await fetch(referenceImageUrl);
          
          if (imageResponse.ok) {
            const imageBlob = await imageResponse.blob();
            const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
            
            console.log(`Downloaded image: ${imageBlob.size} bytes, content-type: ${contentType}`);
            
            // Validate that it's a JPEG (our resize should always produce JPEG)
            // If it's not JPEG, it means the client-side resize failed and we got the original
            if (contentType !== 'image/jpeg') {
              console.warn(`Reference image is ${contentType}, expected image/jpeg. Client-side resize may have failed.`);
              console.warn('Skipping reference image to avoid dimension mismatch with Sora.');
            } else {
              // Additional validation: Check file size (resized JPEG should be < 500KB typically)
              if (imageBlob.size > 1000000) { // 1MB threshold
                console.warn(`Reference image is ${imageBlob.size} bytes, which seems too large for a properly resized image.`);
                console.warn('Expected resized image to be < 500KB. Skipping to avoid dimension mismatch.');
              } else {
                // Force JPEG type for the File object
                const imageFile = new File([imageBlob], 'reference.jpg', { type: 'image/jpeg' });
                formData.append('input_reference', imageFile);
                console.log(`Reference image attached: ${imageBlob.size} bytes, type: image/jpeg, size: ${size}`);
              }
            }
          } else {
            console.warn('Failed to download reference image:', imageResponse.status, imageResponse.statusText);
          }
        } catch (refError) {
          console.warn('Error downloading reference image, continuing without it:', refError);
        }
      }
    }

    console.log('Prompt preview:', prompt.substring(0, 200));

    // Call OpenAI Sora API - correct endpoint: POST /v1/videos
    const response = await fetch('https://api.openai.com/v1/videos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('Sora response:', data);

    // Extract video ID for polling
    const videoId = data.id;

    // Create generation record
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        type: type,
        prompt: prompt,
        settings: { seconds: finalSeconds, aspectRatio, quality, size },
        status: 'processing',
        external_id: videoId,
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

    return new Response(JSON.stringify({
      success: true,
      generationId: generation.id,
      videoId: videoId,
      creditsUsed: creditsRequired,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in generate-video:', error);
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

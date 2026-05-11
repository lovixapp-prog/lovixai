import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Background task to resize image for video formats
async function resizeImageForVideo(
  supabaseUrl: string,
  supabaseServiceKey: string,
  imageUrl: string,
  poseId: string,
  userId: string
) {
  try {
    console.log(`Starting background resize for pose ${poseId}`);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/resize-image-for-video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        poseId,
        userId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resize function error:', errorText);
    } else {
      const result = await response.json();
      console.log('Resize completed:', result);
    }
  } catch (error) {
    console.error('Error calling resize function:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized: ' + (authError?.message || 'No user found'));
    }

    const { influencerId, referenceImageUrl, prompt, influencerDetails, isFirstPose } = await req.json();

    if (!influencerId || !referenceImageUrl) {
      throw new Error('Influencer ID and reference image are required');
    }

    // First pose is FREE, subsequent poses cost 30 credits
    const creditsRequired = isFirstPose ? 0 : 30;

    // Check user credits only if not first pose
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Could not fetch user profile');
    }

    if (!isFirstPose && profile.credits < creditsRequired) {
      throw new Error(`Insufficient credits. Required: ${creditsRequired}, Available: ${profile.credits}`);
    }

    // Build a detailed prompt for face-consistent pose generation
    const detailedPrompt = `Generate a new photo of the EXACT SAME person shown in the reference image. 
CRITICAL: The face, facial features, skin tone, and overall appearance must be IDENTICAL to the reference image.
The person is: ${influencerDetails?.name || 'an influencer'}, ${influencerDetails?.gender || ''}, ${influencerDetails?.ageRange || ''}.
${influencerDetails?.ethnicity ? `Ethnicity: ${influencerDetails.ethnicity}.` : ''}
${influencerDetails?.hairStyle ? `Hair style: ${influencerDetails.hairStyle}.` : ''}
${influencerDetails?.fashionStyle ? `Fashion style: ${influencerDetails.fashionStyle}.` : ''}

New pose/scene: ${prompt || 'A natural, confident pose with a different angle or expression'}

IMPORTANT: 
- Keep the EXACT same face and facial features
- Same skin tone and complexion
- Same hair color and style
- Only change the pose, expression, angle, or background
- Ultra high resolution, professional photography quality`;

    console.log('Generating consistent influencer pose with prompt:', detailedPrompt);

    // Call Lovable AI Gateway with reference image for face consistency
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: detailedPrompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: referenceImageUrl,
                },
              },
            ],
          },
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Lovable AI error:', response.status, errorData);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add credits to your account.');
      }
      throw new Error(`Pose generation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Pose generation response received');

    const base64ImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!base64ImageUrl) {
      const textResponse = data.choices?.[0]?.message?.content;
      if (textResponse) {
        console.error('Model refused to generate:', textResponse);
        throw new Error(`Generation refused: ${textResponse.substring(0, 150)}`);
      }
      throw new Error('No image generated');
    }

    // Extract and upload image
    let resultImageUrl = base64ImageUrl;
    
    if (base64ImageUrl.startsWith('data:image')) {
      const matches = base64ImageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        const imageType = matches[1];
        const base64Data = matches[2];
        const imageBytes = base64Decode(base64Data);
        
        const filename = `${user.id}/influencer-poses/${influencerId}/${Date.now()}-${crypto.randomUUID()}.${imageType}`;
        
        const { error: uploadError } = await supabaseAdmin.storage
          .from('generations')
          .upload(filename, imageBytes, {
            contentType: `image/${imageType}`,
            upsert: false,
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error('Failed to save image');
        }

        const { data: urlData } = supabaseAdmin.storage
          .from('generations')
          .getPublicUrl(filename);

        resultImageUrl = urlData.publicUrl;
        console.log('Pose uploaded to storage:', resultImageUrl);
      }
    }

    // Save pose to influencer_poses table
    const { data: pose, error: poseError } = await supabaseAdmin
      .from('influencer_poses')
      .insert({
        influencer_id: influencerId,
        user_id: user.id,
        image_url: resultImageUrl,
        prompt: prompt,
        is_original: false,
      })
      .select()
      .single();

    if (poseError) {
      console.error('Error saving pose:', poseError);
    }

    // Deduct credits only if not first pose
    if (creditsRequired > 0) {
      await supabaseAdmin
        .from('profiles')
        .update({ credits: profile.credits - creditsRequired })
        .eq('id', user.id);
    }

    // Start background task to resize image for video formats
    // Using globalThis.EdgeRuntime if available, otherwise fire-and-forget with error handling
    if (pose?.id) {
      const resizeTask = resizeImageForVideo(supabaseUrl, supabaseServiceKey, resultImageUrl, pose.id, user.id);
      
      // Use EdgeRuntime.waitUntil if available (Deno Deploy)
      if (typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis) {
        (globalThis as any).EdgeRuntime.waitUntil(resizeTask);
      } else {
        // Fallback: fire and forget with error logging
        resizeTask.catch(err => console.error('Background resize error:', err));
      }
      console.log('Background resize task started for pose:', pose.id);
    }

    return new Response(JSON.stringify({
      success: true,
      imageUrl: resultImageUrl,
      poseId: pose?.id,
      creditsUsed: creditsRequired,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in generate-influencer-pose:', error);
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

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Create admin client for authentication and all operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized: ' + (authError?.message || 'No user found'));
    }

    // Use admin client for all operations
    const supabase = supabaseAdmin;

    const { prompt, style, imageUrl: sourceImageUrl } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Determine if this is an image edit or generation
    const isEdit = !!sourceImageUrl;

    const creditsRequired = 50;

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

    // Enhance prompt with style
    let enhancedPrompt = prompt;
    if (style && style !== 'none') {
      const stylePrompts: Record<string, string> = {
        photorealistic: 'Ultra high resolution, photorealistic, professional photography style',
        artistic: 'Artistic, painterly style with expressive brushstrokes',
        anime: 'Anime style, Japanese animation aesthetic',
        '3d': '3D rendered, high quality CGI, cinematic lighting',
      };
      enhancedPrompt = `${prompt}. ${stylePrompts[style] || ''}`;
    }

    console.log(isEdit ? 'Editing image with Lovable AI Gateway:' : 'Generating image with Lovable AI Gateway:', enhancedPrompt);

    // Build request body based on whether it's edit or generation
    let requestBody;
    
    if (isEdit) {
      // Image editing - include the source image
      requestBody = {
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: enhancedPrompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: sourceImageUrl,
                },
              },
            ],
          },
        ],
        modalities: ['image', 'text'],
      };
    } else {
      // Image generation - text only
      requestBody = {
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: enhancedPrompt,
          },
        ],
        modalities: ['image', 'text'],
      };
    }

    // Call Lovable AI Gateway with image generation/editing model
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Image generation response received');

    // Detailed logging to diagnose issues
    console.log('Response structure:', JSON.stringify({
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasMessage: !!data.choices?.[0]?.message,
      hasImages: !!data.choices?.[0]?.message?.images,
      imagesLength: data.choices?.[0]?.message?.images?.length,
      textContent: data.choices?.[0]?.message?.content?.substring?.(0, 200),
      finishReason: data.choices?.[0]?.finish_reason,
    }));

    const base64ImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!base64ImageUrl) {
      // Check if there's a text response explaining why no image was generated
      const textResponse = data.choices?.[0]?.message?.content;
      if (textResponse) {
        console.error('Model refused to generate image:', textResponse);
        throw new Error(`Image generation refused: ${textResponse.substring(0, 150)}`);
      }
      console.error('No image in response and no text explanation. Full response:', JSON.stringify(data));
      throw new Error('No image generated - the model did not return an image');
    }

    // Extract base64 data and upload to storage
    let resultImageUrl = base64ImageUrl;
    
    if (base64ImageUrl.startsWith('data:image')) {
      // Extract the base64 data from data URL
      const matches = base64ImageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        const imageType = matches[1];
        const base64Data = matches[2];
        const imageBytes = base64Decode(base64Data);
        
        // Generate unique filename
        const filename = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${imageType}`;
        
        // Upload to storage bucket
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('generations')
          .upload(filename, imageBytes, {
            contentType: `image/${imageType}`,
            upsert: false,
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error('Failed to save image');
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
          .from('generations')
          .getPublicUrl(filename);

        resultImageUrl = urlData.publicUrl;
        console.log('Image uploaded to storage:', resultImageUrl);
      }
    }

    // Create generation record with storage URL
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        type: 'image',
        prompt: prompt,
        settings: { style },
        status: 'completed',
        result_url: resultImageUrl,
        credits_used: creditsRequired,
      })
      .select()
      .single();

    if (genError) {
      console.error('Error creating generation record:', genError);
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
      imageUrl: resultImageUrl,
      generationId: generation?.id,
      creditsUsed: creditsRequired,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in generate-image:', error);
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

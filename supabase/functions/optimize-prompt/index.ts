import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const { prompt, type, context, referenceImage } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    if (!type || !['image', 'video'].includes(type)) {
      throw new Error('Type must be "image" or "video"');
    }

    console.log(`Optimizing ${type} prompt:`, prompt.substring(0, 100));
    console.log('Has reference image:', Boolean(referenceImage));

    // If we have a reference image (for influencer videos), use multimodal analysis
    if (type === 'video' && referenceImage) {
      console.log('Using multimodal analysis for influencer video prompt');
      
      const systemPrompt = `You are an expert AI video prompt engineer for Sora 2. Your task is to enhance user prompts to generate videos that feature the EXACT person shown in the reference image.

CRITICAL RULES:
1. ANALYZE the reference image CAREFULLY - study every detail of the person's appearance
2. DESCRIBE the person's EXACT physical features in the prompt:
   - Face shape, skin tone, complexion
   - Hair color, style, length, texture
   - Eye color and shape
   - Any distinctive features (freckles, dimples, etc.)
   - Current clothing and accessories (if visible)
3. The video MUST feature THIS EXACT PERSON - do not change any physical features
4. Keep the person's appearance CONSISTENT throughout the video
5. Enhance the ACTION/SCENE the user requested with:
   - Camera movements (slow pan, tracking shot, dolly, etc.)
   - Lighting and mood (golden hour, soft light, dramatic shadows, etc.)
   - Motion descriptions (how the person moves, gestures, expressions)
   - Cinematic terms (depth of field, lens flare, bokeh, etc.)
6. Keep the enhanced prompt under 250 words
7. Output ONLY the enhanced prompt, no explanations or preambles
8. Write in the same language as the input prompt`;

      const messages = [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: `This is the reference image of the influencer. Study their appearance carefully - the video must feature this EXACT person.` 
            },
            { 
              type: 'image_url', 
              image_url: { url: referenceImage } 
            }
          ]
        },
        {
          role: 'user',
          content: `User's video request: "${prompt}"

${context ? `Additional context: ${context}` : ''}

Create an optimized video prompt that:
1. Starts with a detailed description of the EXACT person from the reference image (physical features, clothing)
2. Then describes the action/scene the user requested
3. Adds cinematic enhancements (camera, lighting, motion)

Remember: The person in the video MUST look identical to the reference image.`
        }
      ];

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash', // Supports vision/multimodal
          messages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Gateway error:', response.status, errorText);
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (response.status === 402) {
          throw new Error('Payment required. Please add credits.');
        }
        throw new Error(`Failed to optimize prompt: ${response.status}`);
      }

      const data = await response.json();
      const optimizedPrompt = data.choices?.[0]?.message?.content?.trim();

      if (!optimizedPrompt) {
        throw new Error('No optimized prompt generated');
      }

      console.log('Optimized prompt (multimodal):', optimizedPrompt.substring(0, 150));

      return new Response(JSON.stringify({
        success: true,
        optimizedPrompt,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Standard text-only optimization (no reference image)
    const systemPrompts = {
      image: `You are an expert AI image prompt engineer for the Nano Banana Pro model (Google Gemini image generation). Your task is to enhance user prompts to generate stunning, high-quality images.

RULES:
- Keep the core idea/subject from the original prompt
- Add rich visual details: lighting, mood, composition, style
- Include technical quality terms like "ultra high resolution", "4K", "detailed", "professional"
- Add artistic direction when appropriate (cinematic, photorealistic, dramatic lighting, etc.)
- Keep the enhanced prompt under 200 words
- Output ONLY the enhanced prompt, no explanations
- Write in the same language as the input prompt`,

      video: `You are an expert AI video prompt engineer for Sora 2. Your task is to enhance user prompts to generate stunning, cinematic AI videos.

RULES:
- Keep the core idea/subject from the original prompt
- Add camera movement descriptions (slow pan, tracking shot, dolly zoom, etc.)
- Include mood, lighting, and atmospheric details
- Add motion descriptions (how subjects move, interact with environment)
- Include cinematic terms (depth of field, lens flare, golden hour, etc.)
- Describe the scene progression if relevant
- Keep the enhanced prompt under 200 words
- Output ONLY the enhanced prompt, no explanations
- Write in the same language as the input prompt`,
    };

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompts[type as 'image' | 'video'] },
          { role: 'user', content: `Enhance this ${type} prompt:\n\n"${prompt}"` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add credits.');
      }
      throw new Error(`Failed to optimize prompt: ${response.status}`);
    }

    const data = await response.json();
    const optimizedPrompt = data.choices?.[0]?.message?.content?.trim();

    if (!optimizedPrompt) {
      throw new Error('No optimized prompt generated');
    }

    console.log('Optimized prompt:', optimizedPrompt.substring(0, 100));

    return new Response(JSON.stringify({
      success: true,
      optimizedPrompt,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in optimize-prompt:', error);
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

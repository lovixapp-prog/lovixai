import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a content compliance assistant. Your task is to rewrite prompts for video generation to ensure they comply with content policies while preserving the original creative intent as much as possible.

Rules to enforce:
1. NO real celebrities, public figures, politicians, or copyrighted characters by name
2. NO nudity, explicit content, sexual suggestions, or revealing clothing descriptions
3. NO violence, gore, blood, weapons, or disturbing imagery
4. NO hate speech, discrimination, slurs, or offensive content
5. NO brand names, logos, trademarked content, or copyrighted music/movies
6. NO minors in any suggestive context
7. NO deepfake-style requests or impersonation of real people

If the prompt violates any rule:
- Replace celebrity/public figure names with generic descriptions (e.g., "a blonde female pop singer" instead of "Taylor Swift")
- Replace copyrighted characters with generic equivalents (e.g., "a superhero in red and blue suit" instead of "Spider-Man")
- Remove or soften explicit/violent content while keeping the scene intent
- Replace brand names with generic terms (e.g., "sports car" instead of "Ferrari")
- Convert suggestive clothing to appropriate alternatives

If the prompt is already fully compliant, return it EXACTLY unchanged.

CRITICAL: Always respond with ONLY the rewritten prompt text. No explanations, no prefixes like "Here's the rewritten prompt:", just the prompt itself.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ 
        sanitizedPrompt: prompt || '',
        wasModified: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.warn('LOVABLE_API_KEY not configured, returning original prompt');
      return new Response(JSON.stringify({ 
        sanitizedPrompt: prompt,
        wasModified: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Sanitizing prompt:', prompt.substring(0, 100) + '...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3, // Low temperature for consistent, predictable outputs
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      // Fallback to original prompt on error
      return new Response(JSON.stringify({ 
        sanitizedPrompt: prompt,
        wasModified: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const sanitizedPrompt = data.choices?.[0]?.message?.content?.trim() || prompt;
    
    const wasModified = sanitizedPrompt.toLowerCase() !== prompt.toLowerCase();
    
    if (wasModified) {
      console.log('Prompt was sanitized:');
      console.log('  Original:', prompt.substring(0, 100));
      console.log('  Sanitized:', sanitizedPrompt.substring(0, 100));
    } else {
      console.log('Prompt passed compliance check unchanged');
    }

    return new Response(JSON.stringify({ 
      sanitizedPrompt,
      wasModified 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in sanitize-prompt:', error);
    // On any error, return the original prompt to not block the user
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      sanitizedPrompt: '',
      wasModified: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

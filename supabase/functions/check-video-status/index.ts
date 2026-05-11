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
    
    // Admin client for all operations
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

    // Poll OpenAI for status
    const response = await fetch(`https://api.openai.com/v1/videos/${generation.external_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI status check error:', response.status, errorData);
      throw new Error(`Failed to check video status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Video status:', data);

    if (data.status === 'completed') {
      // Download the video from OpenAI
      console.log('Downloading video from OpenAI...');
      const videoResponse = await fetch(`https://api.openai.com/v1/videos/${generation.external_id}/content`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
        },
      });

      if (!videoResponse.ok) {
        const errorText = await videoResponse.text();
        console.error('Failed to download video:', videoResponse.status, errorText);
        throw new Error('Failed to download video from OpenAI');
      }

      // Get video as array buffer
      const videoBuffer = await videoResponse.arrayBuffer();
      const videoData = new Uint8Array(videoBuffer);
      
      console.log('Video downloaded, size:', videoData.length, 'bytes');

      // Upload to Supabase Storage
      const fileName = `videos/${user.id}/${generationId}.mp4`;
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from('generations')
        .upload(fileName, videoData, {
          contentType: 'video/mp4',
          upsert: true,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error('Failed to upload video to storage');
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('generations')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log('Video uploaded to storage:', publicUrl);

      // Update generation record with storage URL
      await supabaseAdmin
        .from('generations')
        .update({
          status: 'completed',
          result_url: publicUrl,
        })
        .eq('id', generationId);

      return new Response(JSON.stringify({
        status: 'completed',
        resultUrl: publicUrl,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (data.status === 'failed') {
      await supabase
        .from('generations')
        .update({
          status: 'failed',
          error_message: data.error?.message || 'Video generation failed',
        })
        .eq('id', generationId);

      return new Response(JSON.stringify({
        status: 'failed',
        error: data.error?.message || 'Video generation failed',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return progress info if available
    return new Response(JSON.stringify({
      status: 'processing',
      progress: data.progress || 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in check-video-status:', error);
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

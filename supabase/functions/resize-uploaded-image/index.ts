import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { resize } from "https://deno.land/x/deno_image@0.0.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VIDEO_SIZES = {
  '16:9': { width: 1280, height: 720 },
  '9:16': { width: 720, height: 1280 },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, userId } = await req.json();

    if (!imageUrl) {
      throw new Error('imageUrl is required');
    }

    console.log('Pixel-perfect resizing uploaded image:', imageUrl);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }
    
    const originalBytes = new Uint8Array(await imageResponse.arrayBuffer());
    console.log(`Downloaded image: ${originalBytes.length} bytes`);

    const resizedImages: Record<string, string> = {};

    for (const [aspectRatio, dimensions] of Object.entries(VIDEO_SIZES)) {
      const { width, height } = dimensions;
      console.log(`Resizing to ${aspectRatio} (${width}x${height})...`);

      try {
        // Use deno_image for pixel-perfect resizing
        const resizedBytes = await resize(originalBytes, {
          width,
          height,
        });

        console.log(`Resized to ${resizedBytes.length} bytes`);

        // Upload to storage
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const aspectRatioSafe = aspectRatio.replace(':', '-');
        const filePath = `video-references/${userId || 'anonymous'}/${timestamp}-${randomId}-${aspectRatioSafe}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('generations')
          .upload(filePath, resizedBytes, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) {
          console.error(`Upload failed for ${aspectRatio}:`, uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('generations')
          .getPublicUrl(filePath);

        resizedImages[aspectRatio] = publicUrl;
        console.log(`✓ Created ${aspectRatio}: ${publicUrl}`);

      } catch (error) {
        console.error(`Error processing ${aspectRatio}:`, error);
        continue;
      }
    }

    console.log('Resize complete. Generated versions:', Object.keys(resizedImages));

    return new Response(
      JSON.stringify({ 
        success: true, 
        resizedImages,
        message: `Created ${Object.keys(resizedImages).length} pixel-perfect video formats`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Resize uploaded image error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

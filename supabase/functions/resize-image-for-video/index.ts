import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { resize } from "https://deno.land/x/deno_image@0.0.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sora video dimensions - EXACT pixels required
const VIDEO_SIZES = {
  '16:9': { width: 1280, height: 720 },
  '9:16': { width: 720, height: 1280 },
};

// Helper to decode base64 or fetch image from URL
async function getImageBytes(imageUrl: string): Promise<Uint8Array> {
  // Check if it's a base64 data URL
  const base64Match = imageUrl.match(/^data:image\/\w+;base64,(.+)$/);
  if (base64Match) {
    return Uint8Array.from(atob(base64Match[1]), c => c.charCodeAt(0));
  }
  
  // Otherwise fetch from URL
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

// Get image dimensions from bytes (simple PNG/JPEG header parsing)
function getImageDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  // Check for PNG signature
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    // PNG: width at offset 16, height at offset 20 (big-endian)
    const width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
    const height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
    return { width, height };
  }
  
  // Check for JPEG signature
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
    // JPEG: need to parse markers to find SOF
    let offset = 2;
    while (offset < bytes.length - 8) {
      if (bytes[offset] !== 0xFF) {
        offset++;
        continue;
      }
      const marker = bytes[offset + 1];
      // SOF0, SOF1, SOF2 markers contain dimensions
      if (marker >= 0xC0 && marker <= 0xC2) {
        const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
        const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
        return { width, height };
      }
      // Skip to next marker
      const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
      offset += 2 + length;
    }
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { imageUrl, poseId, userId } = await req.json();

    if (!imageUrl || !poseId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: imageUrl, poseId, userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Pixel-perfect resizing for pose ${poseId}`);

    // Download the original image
    const originalBytes = await getImageBytes(imageUrl);
    console.log(`Downloaded image: ${originalBytes.length} bytes`);

    const originalDimensions = getImageDimensions(originalBytes);
    console.log(`Original dimensions:`, originalDimensions);

    const results: Record<string, string> = {};

    // Process BOTH video formats in PARALLEL for speed
    const resizePromises = Object.entries(VIDEO_SIZES).map(async ([aspectRatio, targetDimensions]) => {
      const { width: targetWidth, height: targetHeight } = targetDimensions;
      
      console.log(`Resizing to ${aspectRatio} (${targetWidth}x${targetHeight})...`);

      try {
        // Use deno_image to resize to exact dimensions
        const resizedBytes = await resize(originalBytes, {
          width: targetWidth,
          height: targetHeight,
        });

        console.log(`Resized ${aspectRatio}: ${resizedBytes.length} bytes`);

        // Upload to storage
        const fileName = `${userId}/poses/${poseId}_${aspectRatio.replace(':', 'x')}.jpg`;
        
        const { error: uploadError } = await supabase.storage
          .from('generations')
          .upload(fileName, resizedBytes, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) {
          console.error(`Upload error for ${aspectRatio}:`, uploadError);
          return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('generations')
          .getPublicUrl(fileName);

        console.log(`✓ Created ${aspectRatio}: ${urlData.publicUrl}`);
        return { aspectRatio, url: urlData.publicUrl };
      } catch (resizeError) {
        console.error(`Resize error for ${aspectRatio}:`, resizeError);
        return null;
      }
    });

    // Wait for all resizes to complete in parallel
    const resizeResults = await Promise.all(resizePromises);
    
    // Collect successful results
    for (const result of resizeResults) {
      if (result) {
        results[result.aspectRatio] = result.url;
      }
    }

    // Update the pose record with the new URLs
    const updateData: Record<string, string> = {};
    if (results['16:9']) updateData.image_url_16_9 = results['16:9'];
    if (results['9:16']) updateData.image_url_9_16 = results['9:16'];

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('influencer_poses')
        .update(updateData)
        .eq('id', poseId)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Failed to update pose record:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update pose record', details: updateError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Pose record updated with resized URLs');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        poseId,
        resizedImages: results,
        message: `Created ${Object.keys(results).length} pixel-perfect video formats`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in resize-image-for-video:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

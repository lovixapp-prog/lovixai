/**
 * Client-side image resizing utility for exact pixel dimensions
 * Required for Sora API which demands precise 720x1280 or 1280x720 images
 */

const VIDEO_DIMENSIONS = {
  '16:9': { width: 1280, height: 720 },
  '9:16': { width: 720, height: 1280 },
};

/**
 * Resize an image to exact dimensions using Canvas API
 * Uses center-crop to fill the target dimensions
 */
export const resizeImageToExactDimensions = (
  imageUrl: string,
  width: number,
  height: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // CORS handling - try with crossOrigin first, fallback to fetching as blob
    img.crossOrigin = 'anonymous';
    
    const processImage = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      // Calculate cover fit (center crop)
      const imgAspect = img.width / img.height;
      const canvasAspect = width / height;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (imgAspect > canvasAspect) {
        // Image is wider than canvas - crop horizontally
        drawHeight = height;
        drawWidth = img.width * (height / img.height);
        offsetX = (width - drawWidth) / 2;
        offsetY = 0;
      } else {
        // Image is taller than canvas - crop vertically
        drawWidth = width;
        drawHeight = img.height * (width / img.width);
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
      }

      // Draw with high-quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      
      // Verify canvas has correct dimensions
      console.log(`Canvas dimensions: ${canvas.width}x${canvas.height}, source image: ${img.width}x${img.height}`);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log(`Resized image: ${canvas.width}x${canvas.height}, size: ${blob.size} bytes, type: ${blob.type}`);
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        0.92 // Slightly lower quality to reduce file size
      );
    };
    
    img.onload = processImage;
    
    img.onerror = async () => {
      console.log('Direct image load failed, trying fetch approach...');
      // CORS failed, try fetching the image as blob and using object URL
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        const retryImg = new Image();
        retryImg.onload = () => {
          // Use retryImg for processing
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Canvas not supported'));
            return;
          }

          const imgAspect = retryImg.width / retryImg.height;
          const canvasAspect = width / height;
          let drawWidth, drawHeight, offsetX, offsetY;
          
          if (imgAspect > canvasAspect) {
            drawHeight = height;
            drawWidth = retryImg.width * (height / retryImg.height);
            offsetX = (width - drawWidth) / 2;
            offsetY = 0;
          } else {
            drawWidth = width;
            drawHeight = retryImg.height * (width / retryImg.width);
            offsetX = 0;
            offsetY = (height - drawHeight) / 2;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(retryImg, offsetX, offsetY, drawWidth, drawHeight);
          
          console.log(`Canvas dimensions (via fetch): ${canvas.width}x${canvas.height}, source: ${retryImg.width}x${retryImg.height}`);
          
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(objectUrl);
              if (blob) {
                console.log(`Resized image (via fetch): ${canvas.width}x${canvas.height}, size: ${blob.size} bytes, type: ${blob.type}`);
                resolve(blob);
              } else {
                reject(new Error('Failed to create blob'));
              }
            },
            'image/jpeg',
            0.92 // Slightly lower quality to reduce file size
          );
        };
        retryImg.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Failed to load image via fetch fallback'));
        };
        retryImg.src = objectUrl;
      } catch (fetchError) {
        reject(new Error(`Failed to load image: ${fetchError}`));
      }
    };
    
    img.src = imageUrl;
  });
};

/**
 * Resize an image for a specific aspect ratio and upload to video-references bucket
 * Returns a signed URL with 1-hour expiration
 */
export const resizeImageForAspectRatio = async (
  supabase: any,
  imageUrl: string,
  aspectRatio: '16:9' | '9:16' | '1:1' | string,
  userId: string,
  onProgress?: (status: string) => void
): Promise<string> => {
  // Map aspect ratio to dimensions (1:1 uses 16:9 dimensions, Sora doesn't support 1:1)
  const targetRatio = aspectRatio === '9:16' ? '9:16' : '16:9';
  const dimensions = VIDEO_DIMENSIONS[targetRatio];
  
  onProgress?.(`Resizing to ${dimensions.width}x${dimensions.height}...`);
  
  // Resize on client side
  const blob = await resizeImageToExactDimensions(imageUrl, dimensions.width, dimensions.height);
  
  onProgress?.('Uploading...');
  
  // Generate unique file path
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  const filePath = `${userId}/${timestamp}-${randomId}.jpg`;
  
  // Upload to video-references bucket (private)
  const { error: uploadError } = await supabase.storage
    .from('video-references')
    .upload(filePath, blob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Generate signed URL (1 hour expiration)
  const { data, error: urlError } = await supabase.storage
    .from('video-references')
    .createSignedUrl(filePath, 3600); // 3600 seconds = 1 hour

  if (urlError || !data?.signedUrl) {
    throw new Error(`Failed to generate signed URL: ${urlError?.message || 'Unknown error'}`);
  }

  onProgress?.('Ready!');
  
  return data.signedUrl;
};

/**
 * DEPRECATED: Use resizeImageForAspectRatio instead for on-demand resizing
 * This function is kept for backward compatibility but will be removed
 */
export const resizeImageForVideoFormats = async (
  supabase: any,
  imageUrl: string,
  userId: string,
  onProgress?: (status: string) => void
): Promise<{ '16:9'?: string; '9:16'?: string }> => {
  console.warn('resizeImageForVideoFormats is deprecated. Use resizeImageForAspectRatio for on-demand resizing.');
  
  const results: { '16:9'?: string; '9:16'?: string } = {};

  onProgress?.('Preparing video formats...');

  // Process both aspect ratios in parallel
  const resizePromises = Object.entries(VIDEO_DIMENSIONS).map(async ([ratio, dimensions]) => {
    try {
      onProgress?.(`Resizing to ${ratio}...`);
      
      const blob = await resizeImageToExactDimensions(
        imageUrl,
        dimensions.width,
        dimensions.height
      );
      
      // Upload to video-references bucket
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const aspectRatioSafe = ratio.replace(':', '-');
      const filePath = `${userId}/${timestamp}-${randomId}-${aspectRatioSafe}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('video-references')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Generate signed URL
      const { data, error: urlError } = await supabase.storage
        .from('video-references')
        .createSignedUrl(filePath, 3600);

      if (urlError || !data?.signedUrl) {
        throw new Error(`Failed to generate signed URL`);
      }
      
      return { ratio, url: data.signedUrl };
    } catch (error) {
      console.error(`Failed to resize to ${ratio}:`, error);
      return { ratio, url: null };
    }
  });

  const resizeResults = await Promise.all(resizePromises);
  
  resizeResults.forEach(({ ratio, url }) => {
    if (url) {
      results[ratio as keyof typeof results] = url;
    }
  });

  onProgress?.('Ready!');
  
  return results;
};

/**
 * DEPRECATED: Use resizeImageForAspectRatio directly
 */
export const getImageForAspectRatio = (
  originalUrl: string,
  resizedImages: { '16:9'?: string; '9:16'?: string } | null,
  aspectRatio: string
): string => {
  if (!resizedImages) return originalUrl;
  
  if (aspectRatio === '16:9' && resizedImages['16:9']) {
    return resizedImages['16:9'];
  }
  if (aspectRatio === '9:16' && resizedImages['9:16']) {
    return resizedImages['9:16'];
  }
  
  // For 1:1, use 16:9 as fallback (will be cropped by API)
  return resizedImages['16:9'] || originalUrl;
};

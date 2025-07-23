// Blade's StoredObject type for blob fields
export interface StoredObject {
  key: string;
  src: string;
  meta: {
    size: number;
    width?: number;
    height?: number;
    type: string;
  };
  placeholder?: {
    base64: string;
  };
}

/**
 * Helper function to get image URL from various formats
 * Handles both string URLs and Blade's StoredObject blob format
 */
export const getImageUrl = (image: string | StoredObject | null | undefined): string | undefined => {
  console.log('🔍 getImageUrl called with:', { image, type: typeof image });

  if (!image) return undefined;

  // Handle string URLs (legacy or direct URLs)
  if (typeof image === 'string') {
    console.log('📝 Processing string image:', image);

    // Check if it's a JSON string that needs parsing (common with RONIN blob fields)
    if (image.startsWith('{') && image.endsWith('}')) {
      try {
        console.log('🔄 Attempting to parse JSON string...');
        const parsed = JSON.parse(image);
        console.log('✅ Parsed JSON object:', parsed);
        // Recursively call with the parsed object
        return getImageUrl(parsed);
      } catch (error) {
        console.log('❌ Failed to parse JSON string:', error);
      }
    }

    // If it's already a full URL, return as-is
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
      console.log('✅ Already full URL, returning as-is');
      return image;
    }

    // If it's just a filename, construct the RONIN storage URL
    // Try different possible storage URL patterns
    const possibleUrls = [
      `https://storage.ronin.co/${image}`,
      `https://cdn.ronin.co/${image}`,
      `/api/storage/${image}`, // Local development endpoint
      image // Fallback to original
    ];

    console.log('🔗 Trying storage URL patterns:', possibleUrls);
    // For now, return the first one, but we might need to test which works
    return possibleUrls[0];
  }

  // Handle StoredObject format from Blade
  if (typeof image === 'object' && image !== null) {
    console.log('📦 Processing object:', image);

    // Check for 'src' property
    if ('src' in image) {
      const src = (image as any).src;
      console.log('📝 Found src property:', src);

      // If src is already a full URL, return as-is
      if (typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:'))) {
        console.log('✅ StoredObject src is full URL, returning as-is');
        return src;
      }

      // If it's just a filename, try different RONIN storage URL patterns
      if (typeof src === 'string') {
        // Check if it's already a full RONIN storage URL
        if (src.startsWith('https://storage.ronin.co/')) {
          console.log('✅ Already a full RONIN storage URL:', src);
          return src;
        }

        // If it's just a filename, check if we have a key field to use instead
        if ('key' in image) {
          const key = (image as any).key;
          if (typeof key === 'string') {
            console.log('🔑 Using key instead of filename for URL construction:', key);
            const keyUrl = `https://storage.ronin.co/${key}`;
            console.log('🔗 Constructed URL from key:', keyUrl);
            return keyUrl;
          }
        }

        // Fallback: construct URL from filename
        const constructedUrl = `https://storage.ronin.co/${src}`;
        console.log('🔗 Constructed RONIN storage URL from filename:', constructedUrl);
        return constructedUrl;
      }
    }

    // Check for 'key' property as alternative - this might be the actual storage key
    if ('key' in image) {
      const key = (image as any).key;
      console.log('📝 Found key property:', key);
      if (typeof key === 'string') {
        // Use the correct RONIN storage URL format
        const keyUrl = `https://storage.ronin.co/${key}`;
        console.log('🔗 Constructed URL from key:', keyUrl);
        return keyUrl;
      }
    }

    // Check if the object itself has a direct URL property
    if ('url' in image) {
      const url = (image as any).url;
      console.log('📝 Found url property:', url);
      if (typeof url === 'string') {
        return url;
      }
    }
  }

  console.log('❌ Unknown image format, returning undefined');
  return undefined;
};

/**
 * Helper function to get placeholder image for loading states
 * Returns the base64 placeholder if available from StoredObject
 */
export const getImagePlaceholder = (image: string | StoredObject | null | undefined): string | undefined => {
  if (!image) return undefined;
  if (typeof image === 'object' && 'placeholder' in image && image.placeholder) {
    return image.placeholder.base64;
  }
  return undefined;
};

/**
 * Helper function to check if an image is a StoredObject (blob)
 */
export const isStoredObject = (image: any): image is StoredObject => {
  return image && typeof image === 'object' && 'src' in image && 'key' in image && 'meta' in image;
};

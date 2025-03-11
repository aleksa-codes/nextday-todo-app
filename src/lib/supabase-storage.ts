import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const BUCKET_NAME = 'user-images';

function getStoragePathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const storageUrl = new URL(url);
    // Match everything after /BUCKET_NAME/
    const regex = new RegExp(`/${BUCKET_NAME}/(.+)$`);
    const match = storageUrl.pathname.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
}

export async function uploadImageToSupabase(file: File, userId: string, currentImageUrl?: string | null) {
  try {
    // Try to delete the old image if it exists
    const oldImagePath = getStoragePathFromUrl(currentImageUrl);
    if (oldImagePath) {
      await supabase.storage.from(BUCKET_NAME).remove([oldImagePath]);
    }

    const extension = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${extension}`;

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

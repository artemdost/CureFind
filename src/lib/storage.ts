import { supabase } from './supabase';

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: { upsert?: boolean },
): Promise<{ path: string; publicUrl?: string }> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: options?.upsert ?? true,
    contentType: file.type,
  });
  if (error) throw error;
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: pub?.publicUrl };
}

export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export function sanitizeFileName(name: string) {
  const ext = name.split('.').pop() ?? '';
  const base = name.substring(0, name.length - ext.length - 1).replace(/[^a-zA-Z0-9_-]/g, '-');
  return `${Date.now()}-${base}.${ext}`.toLowerCase();
}

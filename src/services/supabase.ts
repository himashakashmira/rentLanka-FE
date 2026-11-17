import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = (
  process.env.REACT_APP_SUPABASE_URL ||
  "https://ibpwqqswiydnlbeaslhu.supabase.co"
).trim();

export const SUPABASE_ANON_KEY = (
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  "sb_publishable_IZtaCJ4-TP1HM-mtjk749Q_SkmGiy4K"
).trim();

export const SUPABASE_BUCKET = (
  process.env.REACT_APP_SUPABASE_BUCKET ||
  "rentlanka-images"
).trim();

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

/**
 * Uploads an image File to Supabase Storage and returns the publicUrl.
 * Supports direct client upload as well as backend fallback.
 */
export const uploadImageToSupabase = async (
  file: File,
  bucket = SUPABASE_BUCKET
): Promise<{ success: boolean; publicUrl: string; error?: string }> => {
  try {
    if (!supabase) {
      throw new Error("Supabase client is not configured.");
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const cleanExt = fileExt.replace(/[^a-zA-Z0-9]/g, "");
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;
    const filePath = `items/${fileName}`;

    // 1. Direct Supabase Storage Upload
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (error) {
      console.warn("Direct Supabase storage upload warning:", error.message);
      throw error;
    }

    // 2. Obtain Public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error("Could not generate public URL from Supabase storage.");
    }

    return {
      success: true,
      publicUrl: urlData.publicUrl,
    };
  } catch (directErr: any) {
    console.warn("Direct upload error, falling back to backend upload route:", directErr?.message);

    // 3. Resilient Fallback to Backend Route
    try {
      const API_URL =
        process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.imageUrl) {
        return {
          success: true,
          publicUrl: data.imageUrl,
        };
      }
      throw new Error(data.message || "Backend upload failed");
    } catch (fallbackErr: any) {
      return {
        success: false,
        publicUrl: "",
        error:
          directErr?.message ||
          fallbackErr?.message ||
          "Failed to upload image to Supabase Storage",
      };
    }
  }
};

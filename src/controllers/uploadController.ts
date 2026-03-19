import type { RequestHandler } from "express";
import { getSupabaseAdmin } from "../config/supabaseAdmin";
import { ok } from "../utils/response";
import { HttpError } from "../middlewares/error";

const BUCKET = "exam-assets";
const MAX_BYTES = 100 * 1024; // 100 KB

async function ensureBucket(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) throw new Error(`Gagal membuat bucket storage: ${error.message}`);
  }
}

export const uploadImage: RequestHandler = async (req, res, next) => {
  try {
    const file = (req as Express.Request & { file?: Express.Multer.File }).file;
    if (!file) {
      return next(new HttpError(400, "Tidak ada file yang dikirim."));
    }

    if (file.size > MAX_BYTES) {
      return next(
        new HttpError(
          400,
          `Ukuran gambar terlalu besar. Maksimal 100KB (ukuran saat ini: ${(file.size / 1024).toFixed(1)}KB).`
        )
      );
    }

    if (!file.mimetype.startsWith("image/")) {
      return next(new HttpError(400, "File harus berupa gambar (image/*)."));
    }

    const supabase = getSupabaseAdmin();
    await ensureBucket(supabase);

    const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "png";
    const fileName = `questions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });

    if (uploadError) {
      throw new Error(`Upload gagal: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

    return res.status(201).json(ok("Upload berhasil", { url: data.publicUrl }));
  } catch (e) {
    return next(e);
  }
};

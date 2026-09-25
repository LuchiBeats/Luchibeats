import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Paid files (MP3/WAV/stems/kits/agreements) go to a private R2 bucket when R2_PRIVATE_BUCKET is set.
// They're stored as "private:<key>" and buyers get short-lived signed links instead of permanent CDN URLs.
export const PRIVATE_PREFIX = "private:";
export const PAID_FOLDERS = new Set(["mp3s", "wavs", "stems", "agreements", "kits"]);
export const DOWNLOAD_LINK_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days (S3/R2 maximum)

export function r2Client(): S3Client | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

// Turn a stored file reference into a URL the buyer can download. Public CDN URLs pass through unchanged.
export async function downloadUrlFor(ref: string, downloadName?: string): Promise<string | null> {
  if (!ref.startsWith(PRIVATE_PREFIX)) return ref;
  const client = r2Client();
  const bucket = process.env.R2_PRIVATE_BUCKET;
  if (!client || !bucket) return null;
  const key = ref.slice(PRIVATE_PREFIX.length);
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ...(downloadName ? { ResponseContentDisposition: `attachment; filename="${downloadName.replace(/[^\w.\- ]/g, "_")}"` } : {}),
    }),
    { expiresIn: DOWNLOAD_LINK_TTL_SECONDS },
  );
}

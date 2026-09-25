import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { isAuthenticated } from "@/lib/admin-auth";
import { r2Client, PAID_FOLDERS, PRIVATE_PREFIX } from "@/lib/r2";

const ALLOWED_FOLDERS = new Set(["beats", "covers", "previews", "kits", "mp3s", "wavs", "stems", "agreements"]);
const ALLOWED_TYPES = new Set([
  "audio/mpeg", "audio/wav", "audio/flac", "audio/x-wav",
  "image/jpeg", "image/png", "image/webp",
  "application/zip", "application/x-zip-compressed",
  "application/x-rar-compressed", "application/octet-stream",
  "application/pdf", "text/plain", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

// GET /api/admin/upload-r2?folder=beats&filename=track.mp3&type=audio/mpeg
// Returns { presignedUrl, cdnUrl } — client does PUT directly to R2
export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const folder   = searchParams.get("folder") ?? "beats";
  const filename = searchParams.get("filename") ?? "file";
  const type     = searchParams.get("type") ?? "application/octet-stream";

  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  const client = r2Client();
  if (!client) {
    return NextResponse.json({ error: "R2 credentials not configured" }, { status: 500 });
  }

  // Paid files go to the private bucket (when configured) and are stored as "private:<key>"
  const privateBucket = PAID_FOLDERS.has(folder) ? process.env.R2_PRIVATE_BUCKET : undefined;
  const bucket = privateBucket ?? process.env.R2_BUCKET ?? "luchibeats-audio";

  const ext = filename.split(".").pop() ?? "bin";
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: type });
  const presignedUrl = await getSignedUrl(client, command, { expiresIn: 900 });

  const cdnUrl = privateBucket ? `${PRIVATE_PREFIX}${key}` : `https://cdn.luchibeats.com/${key}`;

  return NextResponse.json({ presignedUrl, cdnUrl });
}

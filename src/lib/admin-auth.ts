import { cookies } from "next/headers";
import { createHmac } from "crypto";

function sessionToken(password: string): string {
  return createHmac("sha256", password).update("luchibeats-admin-session").digest("hex");
}

export async function isAuthenticated(): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) return false;
  const jar = await cookies();
  const token = jar.get("admin_session")?.value;
  return token === sessionToken(process.env.ADMIN_PASSWORD);
}

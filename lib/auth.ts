import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { authDebug } from "./auth-debug";

export async function requireAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) { authDebug("settings redirect", { reason: "Supabase environment is missing" }); redirect("/admin/login?error=configuration"); }
  if (!process.env.ADMIN_EMAIL?.trim()) { authDebug("settings redirect", { reason: "ADMIN_EMAIL is missing" }); redirect("/admin/login?error=configuration"); }
  const db = await createClient();
  const { data: { user }, error } = await db.auth.getUser();
  const expected = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const authenticatedEmail = user?.email?.trim().toLowerCase() ?? null;
  if (error || !user) { authDebug("settings redirect", { reason: "no valid server session", error: error?.message, sessionCookieCreated: false }); redirect("/admin/login?error=session"); }
  if (authenticatedEmail !== expected) { authDebug("settings redirect", { reason: "email mismatch", authenticatedEmail, sessionCookieCreated: true }); redirect("/admin/login?error=unauthorized"); }
  authDebug("settings authorized", { authenticatedEmail, sessionCookieCreated: true });
  return { db, user };
}

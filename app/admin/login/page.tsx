import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { authDebug } from "@/lib/auth-debug";
import LoginForm from "./login-form";
export const metadata={title:"Admin login"};
const errors:Record<string,string>={configuration:"Admin authentication is not fully configured on the server.",session:"Your session could not be verified. Please sign in again.",unauthorized:"This account is not authorized to manage the portfolio."};
export default async function LoginPage({searchParams}:{searchParams:Promise<{error?:string}>}){
 const params=await searchParams,configured=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),adminConfigured=Boolean(process.env.ADMIN_EMAIL?.trim());
 if(configured&&adminConfigured){const db=await createClient();const{data:{user},error}=await db.auth.getUser();const email=user?.email?.trim().toLowerCase();if(user&&email===process.env.ADMIN_EMAIL!.trim().toLowerCase()){authDebug("login page redirect",{reason:"valid admin session",authenticatedEmail:email});redirect("/admin/settings")}if(error)authDebug("login page remains",{reason:"no valid session",error:error.message});else if(user)authDebug("login page remains",{reason:"email mismatch",authenticatedEmail:email})}
 const initialError=!configured||!adminConfigured?errors.configuration:(params.error?errors[params.error]||"Authentication could not be completed.":"");
 return <main className="authPage"><section className="authCard"><a href="/" className="brand">MikRodas</a><span className="kicker">Private area</span><h1>Portfolio admin</h1><p>Sign in with the owner account configured for this site.</p><LoginForm configured={configured&&adminConfigured} initialError={initialError}/><a className="backLink" href="/">← Back to portfolio</a></section></main>
}

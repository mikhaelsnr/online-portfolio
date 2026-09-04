import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authDebug } from "@/lib/auth-debug";

function redirectWithCookies(request:NextRequest,response:NextResponse,path:string){const redirect=NextResponse.redirect(new URL(path,request.url));response.cookies.getAll().forEach(cookie=>redirect.cookies.set(cookie));return redirect}

export async function proxy(request:NextRequest){
  if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||!process.env.ADMIN_EMAIL?.trim()){authDebug("proxy redirect",{reason:"server authentication configuration is missing"});return NextResponse.redirect(new URL("/admin/login?error=configuration",request.url))}
  let response=NextResponse.next({request});
  const db=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{cookies:{getAll:()=>request.cookies.getAll(),setAll(values){values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});
  const sessionCookieCreated=request.cookies.getAll().some(({name})=>name.startsWith("sb-")&&name.includes("auth-token"));
  const{data:{user},error}=await db.auth.getUser();
  const authenticatedEmail=user?.email?.trim().toLowerCase()??null,expectedEmail=process.env.ADMIN_EMAIL.trim().toLowerCase();
  if(error||!user){authDebug("proxy redirect",{reason:"no valid server session",error:error?.message,sessionCookieCreated});return redirectWithCookies(request,response,"/admin/login?error=session")}
  if(authenticatedEmail!==expectedEmail){authDebug("proxy redirect",{reason:"email mismatch",authenticatedEmail,sessionCookieCreated});return redirectWithCookies(request,response,"/admin/login?error=unauthorized")}
  authDebug("proxy authorized",{authenticatedEmail,sessionCookieCreated});
  return response;
}
export const config={matcher:["/admin/settings/:path*"]};

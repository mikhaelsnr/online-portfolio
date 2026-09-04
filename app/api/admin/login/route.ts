import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authDebug } from "@/lib/auth-debug";

type PendingCookie={name:string;value:string;options:CookieOptions};

export async function POST(request:NextRequest){
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||!process.env.ADMIN_EMAIL?.trim()){
  authDebug("signInWithPassword failed",{reason:"server authentication configuration is missing"});
  return NextResponse.json({ok:false,message:"Admin authentication is not fully configured on the server."},{status:500});
 }
 let credentials:unknown;
 try{credentials=await request.json()}catch{return NextResponse.json({ok:false,message:"Invalid login request."},{status:400})}
 const email=typeof credentials==="object"&&credentials!==null&&"email" in credentials?String(credentials.email).trim():"";
 const password=typeof credentials==="object"&&credentials!==null&&"password" in credentials?String(credentials.password):"";
 if(!email||!password)return NextResponse.json({ok:false,message:"Email and password are required."},{status:400});

 const pending=new Map<string,PendingCookie>();
 const supabase=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{cookies:{
  getAll:()=>request.cookies.getAll(),
  setAll:values=>values.forEach(cookie=>pending.set(cookie.name,cookie)),
 }});
 const{data,error}=await supabase.auth.signInWithPassword({email,password});
 const authenticatedEmail=data.user?.email?.trim().toLowerCase()??null;
 authDebug("signInWithPassword completed",{succeeded:!error&&Boolean(data.user&&data.session),authenticatedEmail,sessionCookieCreated:[...pending.keys()].some(name=>name.startsWith("sb-")&&name.includes("auth-token"))});
 if(error)return withCookies(NextResponse.json({ok:false,message:`Login failed: ${error.message}`},{status:401}),pending);
 if(!data.user)return withCookies(NextResponse.json({ok:false,message:"Login failed: Supabase did not return an authenticated user."},{status:401}),pending);
 if(!data.session)return withCookies(NextResponse.json({ok:false,message:"Login failed: Supabase did not create a session."},{status:401}),pending);
 if(authenticatedEmail!==process.env.ADMIN_EMAIL.trim().toLowerCase()){
  authDebug("sign-in authorization failed",{reason:"email mismatch",authenticatedEmail});
  await supabase.auth.signOut();
  return withCookies(NextResponse.json({ok:false,message:"This account is not authorized to manage the portfolio."},{status:403}),pending);
 }
 const sessionCookieCreated=[...pending.keys()].some(name=>name.startsWith("sb-")&&name.includes("auth-token"));
 if(!sessionCookieCreated){authDebug("sign-in authorization failed",{reason:"Supabase emitted no session cookie",authenticatedEmail});return NextResponse.json({ok:false,message:"Supabase authenticated the account but did not create a session cookie."},{status:500})}
 authDebug("sign-in authorized",{authenticatedEmail,sessionCookieCreated});
 return withCookies(NextResponse.json({ok:true,authenticatedEmail,sessionCookieCreated}),pending);
}

function withCookies(response:NextResponse,pending:Map<string,PendingCookie>){pending.forEach(({name,value,options})=>response.cookies.set(name,value,options));return response}

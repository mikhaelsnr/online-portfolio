"use client";
import { FormEvent,useState } from "react";
import { useRouter } from "next/navigation";
type Verification={ok:boolean;message?:string;authenticatedEmail?:string|null;sessionCookieCreated?:boolean};
export default function LoginForm({configured,initialError}:{configured:boolean;initialError?:string}){
 const router=useRouter(),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[message,setMessage]=useState(initialError||""),[loading,setLoading]=useState(false);
 async function submit(e:FormEvent){
  e.preventDefault();if(!configured){setMessage("Supabase environment variables are not configured.");return}setLoading(true);setMessage("");
  try{
   const response=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",cache:"no-store",body:JSON.stringify({email,password})});
   const result=(await response.json()) as Verification;
   if(process.env.NODE_ENV==="development")console.info("[auth] server sign-in",{authenticatedEmail:result.authenticatedEmail??null,sessionCookieCreated:Boolean(result.sessionCookieCreated),authorized:result.ok});
   if(!response.ok||!result.ok){setMessage(result.message||"The server could not complete this login.");setLoading(false);return}
   router.push("/admin/settings");router.refresh();
  }catch{setMessage("Login succeeded, but server verification could not be completed. Please try again.");setLoading(false)}
 }
 return <form onSubmit={submit} className="stackForm"><label>Email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" autoComplete="current-password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)}/></label>{message&&<p className="formError" role="alert">{message}</p>}<button className="button primary" disabled={loading}>{loading?"Signing in…":"Sign in"}</button></form>
}

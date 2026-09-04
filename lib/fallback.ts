import type { PortfolioData } from "./types";

export const fallbackData: PortfolioData = {
  source: "fallback",
  profile: { id: "fallback", full_name: "Mikhael Rodas", professional_title: "Telecom operations × software", short_intro: "I’m Mikhael, a telecom operations professional and automation builder in the Philippines. I create practical tools that make teams faster, work clearer, and services more reliable.", about_heading: "Operator’s mindset. Builder’s curiosity.", about_description: "My background is in live telecom operations, where reliability, clear communication, and calm troubleshooting matter every day.\n\nI bring that same discipline to software. I focus on tools people can actually use—not technology for its own sake. My work connects operations knowledge with automation, web development, mobile apps, APIs, and AI.", location: "Philippines", email: "", phone: null, github_url: null, linkedin_url: null, resume_url: null, resume_filename: null, resume_uploaded_at: null, profile_photo_url: null, profile_photo_alt: "Portrait of Mikhael Rodas" },
  experience: [],
  certifications: [],
  services: [
    { id:"s1", title:"Telecom Operations", description:"SIP troubleshooting, SBC/MSS monitoring, incident coordination, call tracing", icon:"signal", display_order:1, is_visible:true },
    { id:"s2", title:"Workflow Automation", description:"Python, Google Apps Script, n8n, APIs, webhooks, scheduled jobs", icon:"automation", display_order:2, is_visible:true },
    { id:"s3", title:"Application Development", description:"Next.js, Flutter, Supabase, PostgreSQL, GitHub, Vercel", icon:"code", display_order:3, is_visible:true },
    { id:"s4", title:"AI Integration", description:"Knowledge-grounded assistants, prompt design, business process automation", icon:"spark", display_order:4, is_visible:true },
  ],
  projects: [
    ["CHGLog Mobile App","Mobile · Operations","A Flutter-based workflow for validating change numbers, checking in onsite implementers, tracking activities, and notifying teams.",["Flutter","Supabase","Google APIs"]],
    ["Network Alarm Automation","Automation · Telecom","Automated network-device polling, alarm detection, reporting, and ServiceNow ticket creation to reduce repetitive NOC work.",["Python","ServiceNow API","Networking"]],
    ["AI Customer Assistant","AI · Business","A knowledge-grounded customer assistant for Facebook Messenger that answers common questions and routes conversations through n8n.",["n8n","Meta API","AI / RAG"]],
    ["Retail POS & Inventory","Web App · Retail","A multi-branch point-of-sale and inventory platform with role-based access, stock controls, and spreadsheet imports.",["Next.js","Supabase","Vercel"]],
    ["SIPp Route Test Platform","Telecom · Testing","A configurable SIP traffic testing concept for validating international voice routes, signaling behavior, and call outcomes.",["SIPp","SIP","Wireshark"]],
  ].map((p, i) => ({ id:`p${i}`, title:p[0] as string, category:p[1] as string, short_description:p[2] as string, full_description:p[2] as string, technologies:p[3] as string[], project_url:null, github_url:null, featured:i===0, is_visible:true, display_order:i+1, portfolio_project_images:[] })),
};

export type Profile = {
  id: string; full_name: string; professional_title: string; short_intro: string;
  about_heading: string; about_description: string; location: string; email: string;
  phone: string | null; github_url: string | null; linkedin_url: string | null;
  resume_url: string | null; resume_filename: string | null; resume_uploaded_at: string | null;
  profile_photo_url: string | null; profile_photo_alt: string | null;
  created_at?: string; updated_at?: string;
};
export type Experience = { id: string; job_title: string; company: string; location: string | null; start_date: string; end_date: string | null; is_current: boolean; description: string; display_order: number; is_visible: boolean };
export type Service = { id: string; title: string; description: string; icon: string | null; display_order: number; is_visible: boolean };
export type ProjectImage = { id: string; project_id: string; image_url: string; alt_text: string; display_order: number };
export type Project = { id: string; title: string; category: string; short_description: string; full_description: string; technologies: string[]; project_url: string | null; github_url: string | null; cover_image_id?: string | null; featured: boolean; is_visible: boolean; display_order: number; portfolio_project_images?: ProjectImage[] };
export type Certification = { id:string; title:string; issuer:string; issue_date:string; expiration_date:string|null; credential_id:string|null; credential_url:string|null; certificate_file_url:string|null; description:string|null; skills:string[]; display_order:number; is_visible:boolean; is_featured:boolean; created_at?:string; updated_at?:string };
export type PortfolioData = { profile: Profile | null; experience: Experience[]; services: Service[]; projects: Project[]; certifications: Certification[]; source?: "supabase" | "fallback" };

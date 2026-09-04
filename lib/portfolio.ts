import { fallbackData } from "./fallback";
import { createClient } from "./supabase/server";
import type { PortfolioData, Project } from "./types";

type QueryError = { code?: string; message?: string; details?: string; hint?: string };
type QueryResult<T> = { data: T | null; error: QueryError | null };

function reportFailure(section: string, query: string, error: QueryError) {
  if (process.env.NODE_ENV === "development") {
    const diagnostic = {
      query,
      code: error.code || "unknown",
      message: error.message || "Unknown Supabase error",
      details: error.details || undefined,
      hint: error.hint || undefined,
    };
    console.warn(`[portfolio:${section}] Supabase query failed ${JSON.stringify(diagnostic)}`);
  } else {
    console.error(`[portfolio:${section}] Supabase query failed (${error.code || "unknown"})`);
  }
}

function valueOrFallback<T>(section: string, query: string, result: QueryResult<T>, fallback: T) {
  if (!result.error) return { value: result.data ?? fallback, failed: false };
  reportFailure(section, query, result.error);
  return { value: fallback, failed: true };
}

export async function getPortfolioData(includeHidden = false): Promise<PortfolioData> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[portfolio:configuration] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
    return fallbackData;
  }

  const db = await createClient();
  let experienceQuery = db.from("portfolio_experience").select("*").order("display_order");
  let servicesQuery = db.from("portfolio_services").select("*").order("display_order");
  let projectsQuery = db.from("portfolio_projects").select("*, portfolio_project_images(*)").order("featured", { ascending: false }).order("display_order");
  let certificationsQuery = db.from("portfolio_certifications").select("*").order("is_featured", { ascending: false }).order("display_order");

  if (!includeHidden) {
    experienceQuery = experienceQuery.eq("is_visible", true);
    servicesQuery = servicesQuery.eq("is_visible", true);
    projectsQuery = projectsQuery.eq("is_visible", true);
    certificationsQuery = certificationsQuery.eq("is_visible", true);
  }

  const [profileResult, experienceResult, servicesResult, projectsResult, certificationsResult] = await Promise.all([
    db.from("portfolio_profile").select("*").limit(1).maybeSingle(),
    experienceQuery,
    servicesQuery,
    projectsQuery,
    certificationsQuery,
  ]);

  const profile = valueOrFallback("profile", "portfolio_profile.select(*).limit(1).maybeSingle()", profileResult, fallbackData.profile);
  const experience = valueOrFallback("experience", `portfolio_experience.select(*).order(display_order)${includeHidden ? "" : ".eq(is_visible,true)"}`, experienceResult, fallbackData.experience);
  const services = valueOrFallback("services", `portfolio_services.select(*).order(display_order)${includeHidden ? "" : ".eq(is_visible,true)"}`, servicesResult, fallbackData.services);
  const projects = valueOrFallback("projects", `portfolio_projects.select(*,portfolio_project_images(*)).order(featured desc,display_order)${includeHidden ? "" : ".eq(is_visible,true)"}`, projectsResult, fallbackData.projects);
  const certifications = valueOrFallback("certifications", `portfolio_certifications.select(*).order(is_featured desc,display_order)${includeHidden ? "" : ".eq(is_visible,true)"}`, certificationsResult, fallbackData.certifications);

  const sortedProjects = (projects.value || []).map((project: Project) => ({
    ...project,
    portfolio_project_images: (project.portfolio_project_images || []).sort((a, b) => a.display_order - b.display_order),
  }));
  const failed = [profile, experience, services, projects, certifications].some(section => section.failed);

  return {
    profile: profile.value,
    experience: experience.value || [],
    services: services.value || [],
    projects: sortedProjects,
    certifications: certifications.value || [],
    source: failed ? "fallback" : "supabase",
  };
}

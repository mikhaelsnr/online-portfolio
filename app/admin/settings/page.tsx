import { requireAdmin } from "@/lib/auth";
import { getPortfolioData } from "@/lib/portfolio";
import SettingsDashboard from "./settings-dashboard";
export const dynamic="force-dynamic";export const metadata={title:"Portfolio settings",robots:{index:false,follow:false}};
export default async function SettingsPage(){await requireAdmin();const data=await getPortfolioData(true);return <SettingsDashboard initialData={data}/>}

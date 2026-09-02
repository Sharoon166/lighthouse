import { getDashboardStats } from "@/features/dashboard/actions";
import { DashboardCharts } from "@/features/dashboard/components/dashboard-charts";
import { DashboardFeatured } from "@/features/dashboard/components/dashboard-featured";
import { DashboardStatCards } from "@/features/dashboard/components/dashboard-stat-cards";

export default async function AdminPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-10">
      <DashboardStatCards stats={stats} />
      <DashboardFeatured featured={stats.featuredContent} />
      <DashboardCharts stats={stats} />
    </div>
  );
}

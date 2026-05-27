import AppShell from "@/components/AppShell";
import CampaignDashboardDetail from "@/components/dashboard/CampaignDashboardDetail";

export default async function DashboardCampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;

  return (
    <AppShell>
      <CampaignDashboardDetail campaignId={campaignId} />
    </AppShell>
  );
}

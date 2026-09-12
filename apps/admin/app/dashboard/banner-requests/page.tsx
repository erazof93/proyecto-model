import { BannerRequestsTable } from "@/components/dashboard/BannerRequestsTable";
import { getBannerRequests } from "@/lib/db/admin-queries";

export const dynamic = "force-dynamic";

export default async function BannerRequestsPage() {
  const requests = await getBannerRequests();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-dark">Solicitudes de banners</h1>
      <BannerRequestsTable initialRequests={requests} />
    </div>
  );
}

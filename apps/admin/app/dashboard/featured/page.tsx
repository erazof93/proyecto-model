import { FeaturedTable } from "@/components/dashboard/FeaturedTable";
import { FeaturedPageHeader } from "@/components/admin/FeaturedPageHeader";
import { getFeaturedListings, getAllModelos } from "@/lib/db/admin-queries";

export const dynamic = "force-dynamic";

export default async function AdminFeaturedPage() {
  const [listings, models] = await Promise.all([getFeaturedListings(), getAllModelos()]);

  return (
    <div>
      <FeaturedPageHeader models={models.map((m) => ({ id: m.id, name: m.name, username: m.username }))} />
      <FeaturedTable initialListings={listings} />
    </div>
  );
}

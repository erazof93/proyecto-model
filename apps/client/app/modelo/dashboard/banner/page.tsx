import { BannerManager } from "@/components/dashboard/BannerManager";
import { getSession } from "@/lib/auth/session";
import { getBannerRequestsByModel, getModelBanner } from "@/lib/db/queries";

export default async function BannerPage() {
  const session = await getSession();
  const modelId = session?.modelId;

  const [banner, requests] = modelId
    ? await Promise.all([getModelBanner(modelId), getBannerRequestsByModel(modelId)])
    : [null, []];

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-dark">Mi banner</h1>
      <p className="mb-6 max-w-2xl text-sm text-dark/50">
        El banner es tu foto destacada en el carrusel de la home (16:9). Solicítalo aquí — un
        admin lo revisa y, una vez aprobado, subes la foto.
      </p>
      <BannerManager initialBanner={banner} initialRequests={requests} />
    </div>
  );
}

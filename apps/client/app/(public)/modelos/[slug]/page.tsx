import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generateModelMetadata } from "@proyecto-model/utils";
import { ModelProfile } from "@/components/modelos/ModelProfile";
import { Logo } from "@/components/ui/Logo";
import { getModeloBySlug, getReviews } from "@/lib/db/queries";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModeloBySlug(slug);
  if (!model) return {};
  const meta = generateModelMetadata(model);
  return { title: meta.title, description: meta.description };
}

export default async function ModelProfilePage({ params }: { params: Params }) {
  const { slug } = await params;
  const model = await getModeloBySlug(slug);
  if (!model) notFound();

  return (
    <>
      <div className="border-b border-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <Logo href="/" />
          <span className="text-dark/40">Perfil</span>
        </div>
      </div>
      <ModelProfile model={model} reviews={await getReviews(model.id)} />
    </>
  );
}

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { addModelPhoto } from "@/lib/db/photos";
import { getModelPhotos } from "@/lib/db/queries";

export async function GET() {
  const session = await getSession();
  if (!session?.modelId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const photos = await getModelPhotos(session.modelId);
  return NextResponse.json({ photos });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.modelId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const cloudinaryId = typeof body?.cloudinary_id === "string" ? body.cloudinary_id : "";
  const cloudinaryUrl = typeof body?.cloudinary_url === "string" ? body.cloudinary_url : "";

  if (!cloudinaryId || !cloudinaryUrl) {
    return NextResponse.json(
      { error: "cloudinary_id y cloudinary_url son requeridos" },
      { status: 400 },
    );
  }

  const photo = await addModelPhoto(session.modelId, cloudinaryId, cloudinaryUrl);
  return NextResponse.json({ photo }, { status: 201 });
}

import { NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session?.modelId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await pool.query(
    "SELECT * FROM model_photos WHERE model_id = $1 ORDER BY order_index ASC",
    [session.modelId],
  );
  return NextResponse.json({ photos: result.rows });
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

  const result = await pool.query(
    `INSERT INTO model_photos (model_id, cloudinary_id, cloudinary_url, is_verified, is_primary, order_index)
     VALUES ($1, $2, $3, false, false, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM model_photos WHERE model_id = $1))
     RETURNING *`,
    [session.modelId, cloudinaryId, cloudinaryUrl],
  );

  return NextResponse.json({ photo: result.rows[0] }, { status: 201 });
}

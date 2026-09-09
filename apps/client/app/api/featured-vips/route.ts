import { NextResponse } from "next/server";
import { getVipCarousel } from "@/lib/db/queries";
import { nextHourlyRefresh } from "@/lib/db/helpers";

/**
 * Público: hasta 8 VIP (destacadas TOP vigentes) elegidas al azar, rotan cada
 * hora. `hourlySample` es determinística por hora → la respuesta es cacheable
 * (s-maxage 1h) y consistente entre instancias sin caché en memoria.
 */
export async function GET() {
  try {
    const data = await getVipCarousel(8);
    const nextRefresh = nextHourlyRefresh();
    return NextResponse.json(
      { data, nextRefresh: new Date(nextRefresh).toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

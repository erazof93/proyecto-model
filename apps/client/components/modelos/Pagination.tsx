import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  searchParams = {},
  basePath = "/modelos",
  hash = "",
}: {
  page: number;
  totalPages: number;
  searchParams?: Record<string, string | undefined>;
  /** Ruta base de los enlaces (p.ej. "/" para la home). */
  basePath?: string;
  /** Ancla opcional para volver a la sección tras navegar (p.ej. "#recomendadas"). */
  hash?: string;
}) {
  const hrefForPage = (target: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(target));
    return `${basePath}?${params.toString()}${hash}`;
  };

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="flex items-center justify-center gap-3 py-8 text-sm text-dark/50">
      {hasPrev ? (
        <Link href={hrefForPage(page - 1)} className="font-medium text-primary hover:underline">
          &larr; Retroceder
        </Link>
      ) : (
        <span className="opacity-40">&larr; Retroceder</span>
      )}

      <span aria-hidden>&bull;</span>

      <span>
        Página {page} de {totalPages}
      </span>

      <span aria-hidden>&bull;</span>

      {hasNext ? (
        <Link href={hrefForPage(page + 1)} className="font-medium text-primary hover:underline">
          Siguiente &rarr;
        </Link>
      ) : (
        <span className="opacity-40">Siguiente &rarr;</span>
      )}
    </div>
  );
}

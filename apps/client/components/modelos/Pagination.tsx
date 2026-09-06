import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  searchParams = {},
}: {
  page: number;
  totalPages: number;
  searchParams?: Record<string, string | undefined>;
}) {
  const nextHref = (() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(page + 1));
    return `/modelos?${params.toString()}`;
  })();

  return (
    <div className="flex items-center justify-center gap-2 py-8 text-sm text-dark/50">
      <span>
        Página {page} de {totalPages}
      </span>
      {page < totalPages && (
        <>
          <span aria-hidden>&bull;</span>
          <Link href={nextHref} className="font-medium text-primary hover:underline">
            Siguiente
          </Link>
        </>
      )}
    </div>
  );
}

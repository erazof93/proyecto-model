"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ListFilter, X } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export type FilterDrawerOptions = { cities: string[]; genders: string[]; services: string[] };

/** Orden fijo, mismos valores que el enum de la BD (WOMAN | MAN | TRANSGENDER). */
const GENDERS = [
  { value: "WOMAN", label: "Mujer" },
  { value: "MAN", label: "Hombre" },
  { value: "TRANSGENDER", label: "Trans" },
] as const;

const DEFAULT_GENDER = "WOMAN";

type FilterState = {
  gender: string;
  city: string;
  service: string;
  type: string;
  isNew: boolean;
};

/** Botón que abre el panel (visible solo en mobile, lo controla el contenedor). */
function FilterTrigger({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Filtros"
      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent text-white shadow-sm transition hover:brightness-105"
    >
      <ListFilter className="h-5 w-5" />
    </button>
  );
}

function FilterDrawerInner({ options }: { options?: FilterDrawerOptions }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const cities = options?.cities ?? [];
  const services = options?.services ?? [];

  const readFromUrl = (): FilterState => {
    const urlType = searchParams.get("type");
    return {
      gender: searchParams.get("gender") || DEFAULT_GENDER,
      city: searchParams.get("city") ?? "",
      service: searchParams.get("service") ?? "",
      type: urlType === "TOP" || urlType === "BANNER" ? urlType : "",
      isNew: searchParams.get("isNew") === "true",
    };
  };

  const [filters, setFilters] = useState<FilterState>(readFromUrl);

  // Bloquea el scroll de fondo y cierra con Esc mientras el panel está abierto.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const open = () => {
    setFilters(readFromUrl());
    setIsOpen(true);
  };

  const handleApply = () => {
    const params = new URLSearchParams(searchParams);
    const setOrDelete = (key: string, value: string) =>
      value ? params.set(key, value) : params.delete(key);

    setOrDelete("gender", filters.gender);
    setOrDelete("city", filters.city);
    setOrDelete("service", filters.service);
    setOrDelete("type", filters.type);
    if (filters.isNew) params.set("isNew", "true");
    else params.delete("isNew");
    params.delete("page"); // cualquier cambio de filtro vuelve a la página 1

    const qs = params.toString();
    router.push(qs ? `/modelos?${qs}` : "/modelos");
    setIsOpen(false);
  };

  const handleClear = () => {
    setFilters({ gender: DEFAULT_GENDER, city: "", service: "", type: "", isNew: false });
    router.push("/modelos");
    setIsOpen(false);
  };

  return (
    <>
      <FilterTrigger onClick={open} />

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-dark/40 transition-opacity",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden
      />

      {/* Panel inferior */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filtros"
        aria-hidden={!isOpen}
        data-testid="filter-drawer-panel"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl transition-transform duration-300",
          isOpen ? "translate-y-0" : "pointer-events-none translate-y-full",
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-dark">Filtros</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar"
            className="rounded-md p-1 text-dark/50 hover:bg-light_bg hover:text-dark"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dark/40">Género</p>
            <div className="space-y-2">
              {GENDERS.map(({ value, label }) => (
                <Checkbox
                  key={value}
                  id={`fd-g-${value}`}
                  name="fd-gender"
                  type="radio"
                  value={value}
                  label={label}
                  checked={filters.gender === value}
                  onChange={() => setFilters((f) => ({ ...f, gender: value }))}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dark/40">Ciudad</p>
            <Select
              aria-label="Ciudad"
              value={filters.city}
              onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
            >
              <option value="">Todas</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dark/40">
              Servicio
            </p>
            <Select
              aria-label="Servicio"
              value={filters.service}
              onChange={(e) => setFilters((f) => ({ ...f, service: e.target.value }))}
            >
              <option value="">Todos</option>
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dark/40">Tipo</p>
            <Select
              aria-label="Tipo"
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="">Todas las modelos</option>
              <option value="TOP">Solo VIP destacadas</option>
              <option value="BANNER">Solo BANNER</option>
            </Select>
          </div>

          <Checkbox
            id="fd-isnew"
            label="Solo nuevas integrantes"
            checked={filters.isNew}
            onChange={(e) => setFilters((f) => ({ ...f, isNew: e.target.checked }))}
          />
        </div>

        <div className="mt-8 flex gap-3">
          <Button type="button" onClick={handleApply} className="flex-1">
            Aplicar
          </Button>
          <Button type="button" variant="outline" onClick={handleClear} className="flex-1">
            Limpiar
          </Button>
        </div>
      </div>
    </>
  );
}

/**
 * Panel de filtros para mobile: un botón que despliega un drawer inferior con
 * todos los filtros de /modelos (género, ciudad, servicio, tipo, nuevas).
 * "Aplicar" navega a /modelos con los parámetros; "Limpiar" resetea.
 *
 * Envuelto en <Suspense> porque usa useSearchParams (requisito de Next para
 * aislarlo del prerender).
 */
export function FilterDrawer({ options }: { options?: FilterDrawerOptions }) {
  return (
    <Suspense fallback={<FilterTrigger />}>
      <FilterDrawerInner options={options} />
    </Suspense>
  );
}

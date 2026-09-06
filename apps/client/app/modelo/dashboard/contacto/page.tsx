import { notFound } from "next/navigation";
import { Send } from "lucide-react";
import { ADMIN_TELEGRAM_USERNAME } from "@proyecto-model/config";
import { getSession } from "@/lib/auth/session";
import { getModelDashboardSummary } from "@/lib/db/queries";

export default async function ContactoAdminPage() {
  const session = await getSession();
  const summary = session?.modelId ? await getModelDashboardSummary(session.modelId) : null;
  if (!summary) notFound();

  const message = `Hola, soy ${summary.name}. Tengo una consulta sobre mi perfil.`;
  const telegramLink = `https://t.me/${ADMIN_TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-dark">Contactar admin</h1>
      <p className="mb-4 max-w-md text-dark/60">
        ¿Tienes dudas sobre tu perfil, tus fotos o un destacado? Escríbenos directamente por
        Telegram y te responderemos a la brevedad.
      </p>
      <a
        href={telegramLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md bg-gradient-to-br from-primary to-accent px-7 py-3 text-sm font-semibold text-white transition hover:brightness-105"
      >
        <Send className="h-4 w-4" /> Contactar por Telegram
      </a>
    </div>
  );
}

import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ContactoAdminPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-dark">Contactar admin</h1>
      <p className="mb-4 max-w-md text-dark/60">
        ¿Tienes dudas sobre tu perfil, tus fotos o un destacado? Escríbenos directamente por
        Telegram y te responderemos a la brevedad.
      </p>
      <Button className="gap-2">
        <Send className="h-4 w-4" /> Contactar por Telegram
      </Button>
    </div>
  );
}

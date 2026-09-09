"use client";

import { MessageCircle, Instagram, Music2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Props = {
  modelId: string;
  whatsapp?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  telegram?: string | null;
};

/** Registra el click sin bloquear la apertura del enlace. */
function track(modelId: string, interaction_type: "WHATSAPP_CLICK" | "INSTAGRAM_CLICK") {
  fetch("/api/modelos/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model_id: modelId, interaction_type }),
    keepalive: true,
  }).catch(() => {});
}

const handle = (v: string) =>
  v
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?(instagram\.com|t\.me|tiktok\.com)\/@?/i, "");

function openTab(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function ContactButtons({ modelId, whatsapp, instagram, tiktok, telegram }: Props) {
  return (
    <div className="space-y-2">
      <Button
        fullWidth
        className="justify-start gap-2"
        disabled={!whatsapp}
        onClick={() => {
          if (!whatsapp) return;
          track(modelId, "WHATSAPP_CLICK");
          openTab(`https://wa.me/${whatsapp.replace(/\D/g, "")}`);
        }}
      >
        <MessageCircle className="h-4 w-4" /> Contactar por WhatsApp
      </Button>
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="secondary"
          className="gap-2"
          disabled={!instagram}
          onClick={() => {
            if (!instagram) return;
            track(modelId, "INSTAGRAM_CLICK");
            openTab(`https://instagram.com/${handle(instagram)}`);
          }}
        >
          <Instagram className="h-4 w-4" /> Instagram
        </Button>
        <Button
          variant="secondary"
          className="gap-2"
          disabled={!tiktok}
          onClick={() => tiktok && openTab(`https://www.tiktok.com/@${handle(tiktok)}`)}
        >
          <Music2 className="h-4 w-4" /> TikTok
        </Button>
        <Button
          variant="secondary"
          className="gap-2"
          disabled={!telegram}
          onClick={() => telegram && openTab(`https://t.me/${handle(telegram)}`)}
        >
          <Send className="h-4 w-4" /> Telegram
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CreateFeaturedDialog } from "@/components/admin/CreateFeaturedDialog";

export function FeaturedPageHeader({
  models,
}: {
  models: { id: string; name: string; username: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4 flex items-center justify-end">
      <Button className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Crear destacado
      </Button>
      <CreateFeaturedDialog
        open={open}
        onClose={() => setOpen(false)}
        models={models}
        onCreated={() => router.refresh()}
      />
    </div>
  );
}

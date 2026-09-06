import { Flower2 } from "lucide-react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-primary to-accent px-6 py-4 text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-2 text-lg font-bold">
          <Flower2 className="h-5 w-5" /> Models <span className="font-normal opacity-70">Admin</span>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl">
        <AdminSidebar />
        <main className="flex-1 space-y-6 bg-white p-6">{children}</main>
      </div>
    </div>
  );
}

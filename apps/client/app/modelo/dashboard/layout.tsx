import { Logo } from "@/components/ui/Logo";
import { DashboardNav } from "@/components/layout/DashboardNav";

export default function ModeloLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-light_bg">
      <div className="border-b border-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <Logo href="/" />
          <span className="text-dark/40">Dashboard</span>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl">
        <DashboardNav />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

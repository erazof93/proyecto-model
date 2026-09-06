import { cn } from "@/lib/cn";

type Tone = "primary" | "warning" | "success" | "danger" | "light";

const toneClasses: Record<Tone, string> = {
  primary: "bg-gradient-to-br from-primary to-accent text-white",
  warning: "bg-warning-light text-warning-dark",
  success: "bg-success-light text-success-dark",
  danger: "bg-danger-light text-danger-dark",
  light: "bg-light_bg text-primary",
};

export function StatCard({
  value,
  label,
  tone = "light",
}: {
  value: string | number;
  label: string;
  tone?: Tone;
}) {
  return (
    <div className={cn("rounded-md p-6 text-center", toneClasses[tone])}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm opacity-90">{label}</p>
    </div>
  );
}

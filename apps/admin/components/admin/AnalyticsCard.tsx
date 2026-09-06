export function AnalyticsCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-md bg-white p-6 shadow-sm ring-1 ring-black/5">
      <p className="text-sm font-medium text-dark/50">{title}</p>
      <h3 className="mt-1 text-3xl font-bold text-dark">{value}</h3>
      {subtitle && <p className="mt-3 text-xs text-dark/40">{subtitle}</p>}
    </div>
  );
}

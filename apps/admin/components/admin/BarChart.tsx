export function BarChart({
  title,
  data,
  unit = "",
}: {
  title: string;
  data: { label: string; value: number }[];
  unit?: string;
}) {
  const maxValue = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="rounded-md bg-white p-6 shadow-sm ring-1 ring-black/5">
      <h3 className="mb-4 text-sm font-bold text-dark">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-dark/40">Sin datos.</p>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-dark/70">{item.label}</span>
                <span className="text-sm font-semibold text-dark">
                  {item.value} {unit}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-light_bg">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

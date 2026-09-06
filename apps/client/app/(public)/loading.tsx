export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-6 py-8">
      <div className="mb-8 h-96 rounded-md bg-light_bg" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-72 rounded-md bg-light_bg" />
        ))}
      </div>
    </div>
  );
}

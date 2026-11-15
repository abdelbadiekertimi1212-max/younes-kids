export function PlaceholderScreen({
  title,
  note,
}: {
  title: string;
  note: string;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-ink">{title}</h1>
      <span className="inline-block rounded-full bg-brand-light px-4 py-1 text-sm font-medium text-brand-dark">
        {note}
      </span>
    </div>
  );
}

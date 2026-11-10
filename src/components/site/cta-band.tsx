/** Full-width teal band (ClassyAds newsletter strip) used as the call to action. */
export function CtaBand({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action: { href: string; label: string } | null;
}) {
  return (
    <section className="bg-brand py-12">
      <div className="container-page flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg text-white">{title}</h2>
          <p className="mt-1.5 text-white/90">{text}</p>
        </div>
        {action && (
          <a
            href={action.href}
            className="inline-flex h-[43px] shrink-0 items-center justify-center self-start bg-white px-6 text-black transition hover:bg-white/90 md:self-auto"
          >
            {action.label}
          </a>
        )}
      </div>
    </section>
  );
}

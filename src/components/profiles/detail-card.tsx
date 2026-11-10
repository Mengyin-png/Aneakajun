/** Main-column content block on detail pages (ClassyAds card + teal underlined heading). */
export function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-elevated p-6 sm:p-8">
      <h2 className="relative mb-6 pb-2 text-[1.35rem] font-normal text-brand after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-12 after:bg-brand">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Sidebar block on detail pages. */
export function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-elevated p-6">
      <h2 className="mb-5 text-lg font-normal text-black">{title}</h2>
      {children}
    </section>
  );
}

import Link from "next/link";
import { PageHero } from "@/components/site/hero";
import { getDictionary } from "@/lib/i18n/dictionaries";

// not-found has no params; English is used (Khmer pages fall back here too).
export default function NotFound() {
  const t = getDictionary("en");
  return (
    <>
      <PageHero title={t.common.notFoundTitle} subtitle={t.common.notFoundText} />
      <div className="bg-canvas py-20 text-center">
        <p className="text-[5rem] leading-none text-brand">404</p>
        <Link href="/" className="btn-primary mt-8 h-[43px] px-6 text-base font-normal">
          {t.common.backHome}
        </Link>
      </div>
    </>
  );
}

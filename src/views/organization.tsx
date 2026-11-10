import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { OrganizationProfileView } from "@/components/profiles/organization-profile";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { plainText } from "@/lib/text";
import { pageMetadata } from "@/lib/seo";
import { getOrganizationProfile } from "@/server/queries/organizations";
import { resolveLocale } from "./locale";

type Props = { params: Promise<{ locale: string; slug: string }> };

const load = cache(async (slug: string, locale: "en" | "km") => getOrganizationProfile({ slug }, locale));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const org = await load((await params).slug, locale);
  if (!org) return {};
  return pageMetadata({
    locale,
    path: `/organizations/${org.slug}`,
    title: org.seoTitle || org.name,
    description: org.seoDescription || org.tagline || (org.description ? plainText(org.description) : null),
    image: org.coverUrl ?? org.logoUrl,
  });
}

export default async function OrganizationPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const org = await load((await params).slug, locale);
  if (!org) notFound();
  return <OrganizationProfileView org={org} locale={locale} t={getDictionary(locale)} />;
}

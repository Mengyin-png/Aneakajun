import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { PersonProfileView } from "@/components/profiles/person-profile";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { plainText } from "@/lib/text";
import { pageMetadata } from "@/lib/seo";
import { getPersonProfile } from "@/server/queries/people";
import { resolveLocale } from "./locale";

type Props = { params: Promise<{ locale: string; slug: string }> };

const load = cache(async (slug: string, locale: "en" | "km") => getPersonProfile({ slug }, locale));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const person = await load((await params).slug, locale);
  if (!person) return {};
  return pageMetadata({
    locale,
    path: `/people/${person.slug}`,
    title: person.seoTitle || person.name,
    description: person.seoDescription || person.headline || (person.bio ? plainText(person.bio) : null),
    image: person.photo?.url,
    type: "profile",
  });
}

export default async function PersonPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const person = await load((await params).slug, locale);
  if (!person) notFound();
  return <PersonProfileView person={person} locale={locale} t={getDictionary(locale)} />;
}

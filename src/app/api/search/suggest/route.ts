import { NextResponse, type NextRequest } from "next/server";
import { isLocale } from "@/lib/i18n/config";
import { searchSuggestions } from "@/server/queries/search";
import { cleanQuery } from "@/server/queries/shared";

export async function GET(request: NextRequest) {
  const q = cleanQuery(request.nextUrl.searchParams.get("q"));
  const localeParam = request.nextUrl.searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : "en";
  const suggestions = await searchSuggestions(q, locale);
  return NextResponse.json(
    { suggestions },
    { headers: { "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300" } },
  );
}

import type { Locale } from "@/lib/i18n/config";
import { Icon } from "./icons";
import { SuggestInput } from "./suggest-input";

type Option = { value: string; label: string };

/**
 * ClassyAds search bar: keyword · location · category · Search, on a
 * translucent panel. A plain GET form to the search page (works without JS).
 */
export function HeroSearch({
  action,
  locations,
  categories,
  labels,
  defaults = {},
  locale,
  typeLabels,
}: {
  action: string;
  locations: Option[];
  categories: Option[];
  labels: {
    keyword: string;
    location: string;
    allLocations: string;
    allCategories: string;
    search: string;
    category: string;
  };
  locale: Locale;
  typeLabels: { person: string; organization: string; article: string };
  defaults?: { q?: string; location?: string; category?: string };
}) {
  return (
    <form
      method="get"
      action={action}
      role="search"
      className="mx-auto grid max-w-[1110px] gap-3 rounded-[7px] bg-white/30 p-4 backdrop-blur-[2px] sm:p-5 md:grid-cols-[1.4fr_1fr_1fr_auto] md:gap-[30px]"
    >
      <label className="sr-only" htmlFor="hero-q">
        {labels.keyword}
      </label>
      <SuggestInput
        id="hero-q"
        locale={locale}
        placeholder={labels.keyword}
        typeLabels={typeLabels}
        defaultValue={defaults.q}
        className="h-[43px] text-base"
      />

      <div className="relative">
        <label className="sr-only" htmlFor="hero-location">
          {labels.location}
        </label>
        <select
          id="hero-location"
          name="location"
          defaultValue={defaults.location ?? ""}
          className="input h-[43px] appearance-none pr-10 text-base"
        >
          <option value="">{labels.allLocations}</option>
          {locations.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevronDown"
          className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-[#4d4d4d]"
        />
      </div>

      <div className="relative">
        <label className="sr-only" htmlFor="hero-category">
          {labels.category}
        </label>
        <select
          id="hero-category"
          name="category"
          defaultValue={defaults.category ?? ""}
          className="input h-[43px] appearance-none pr-10 text-base"
        >
          <option value="">{labels.allCategories}</option>
          {categories.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevronDown"
          className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-[#4d4d4d]"
        />
      </div>

      <button type="submit" className="btn-primary h-[43px] px-8 text-base font-normal md:px-10">
        {labels.search}
      </button>
    </form>
  );
}

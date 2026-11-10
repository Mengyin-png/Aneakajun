import View, { generateMetadata as viewMetadata } from "@/views/people";
import type { SearchParams } from "@/views/locale";

// Rendered per request: results depend on the search/filter query string.
type Props = { searchParams: SearchParams };
const params = Promise.resolve({ locale: "en" });

export const generateMetadata = ({ searchParams }: Props) => viewMetadata({ params, searchParams });

export default function Page({ searchParams }: Props) {
  return <View params={params} searchParams={searchParams} />;
}

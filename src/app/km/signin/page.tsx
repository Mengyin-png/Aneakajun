import View, { generateMetadata as viewMetadata } from "@/views/signin";
import type { SearchParams } from "@/views/locale";

export const dynamic = "force-dynamic";

const params = Promise.resolve({ locale: "km" });
export const generateMetadata = () => viewMetadata({ params, searchParams: Promise.resolve({}) });

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return <View params={params} searchParams={searchParams} />;
}

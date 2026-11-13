import View, { generateMetadata as viewMetadata } from "@/views/opportunities";

export const dynamic = "force-dynamic";

const params = Promise.resolve({ locale: "en" });
export const generateMetadata = () => viewMetadata({ params });

export default function Page() {
  return <View params={params} />;
}


import View, { generateMetadata as viewMetadata } from "@/views/about";

// Cached (ISR) and refreshed every 5 minutes or when an admin saves.
export const revalidate = 300;

const params = Promise.resolve({ locale: "en" });
export const generateMetadata = () => viewMetadata({ params });

export default function Page() {
  return <View params={params} />;
}

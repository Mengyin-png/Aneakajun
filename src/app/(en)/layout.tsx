import PublicLayout, { generateMetadata as layoutMetadata, viewport } from "@/views/layout";

const params = Promise.resolve({ locale: "en" });

export { viewport };
export const generateMetadata = () => layoutMetadata({ children: null, params });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PublicLayout params={params}>{children}</PublicLayout>;
}

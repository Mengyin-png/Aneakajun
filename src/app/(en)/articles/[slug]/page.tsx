import View, { generateMetadata as viewMetadata } from "@/views/article";

// Rendered on first request, then cached (ISR) and refreshed after 5 minutes or
// whenever an admin saves. No request data is read, so forcing static is safe.
export const revalidate = 300;
export const dynamic = "force-static";

type Props = { params: Promise<{ slug: string }> };
const withLocale = (p: Props["params"]) => p.then((x) => ({ ...x, locale: "en" }));

export const generateMetadata = ({ params }: Props) => viewMetadata({ params: withLocale(params) });

export default function Page({ params }: Props) {
  return <View params={withLocale(params)} />;
}

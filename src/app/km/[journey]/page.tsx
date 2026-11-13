import View, { generateMetadata as viewMetadata } from "@/views/journey";

// Cached (ISR); unknown journey keys 404.
export const revalidate = 300;
export const dynamic = "force-static";

type Props = { params: Promise<{ journey: string }> };
const withLocale = (p: Props["params"]) => p.then((x) => ({ ...x, locale: "km" }));

export const generateMetadata = ({ params }: Props) => viewMetadata({ params: withLocale(params) });

export default function Page({ params }: Props) {
  return <View params={withLocale(params)} />;
}

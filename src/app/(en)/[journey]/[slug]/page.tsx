import View, { generateMetadata as viewMetadata } from "@/views/guidance";

// Per request: the 40% guest preview depends on the visitor's session.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ journey: string; slug: string }> };
const withLocale = (p: Props["params"]) => p.then((x) => ({ ...x, locale: "en" }));

export const generateMetadata = ({ params }: Props) => viewMetadata({ params: withLocale(params) });

export default function Page({ params }: Props) {
  return <View params={withLocale(params)} />;
}

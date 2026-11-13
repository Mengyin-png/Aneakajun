import View, { generateMetadata as viewMetadata } from "@/views/journey-form";

// Per request: shows the member's own submissions.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ journey: string }> };
const withLocale = (p: Props["params"]) => p.then((x) => ({ ...x, locale: "en" }));

export const generateMetadata = ({ params }: Props) => viewMetadata({ params: withLocale(params) });

export default function Page({ params }: Props) {
  return <View params={withLocale(params)} />;
}

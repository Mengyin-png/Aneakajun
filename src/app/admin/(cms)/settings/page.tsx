import { AdminPageHeader } from "@/components/admin/admin-table";
import { SettingsForm, type SettingsValues } from "@/components/admin/settings-form";
import { requireUser } from "@/lib/auth/guard";
import { getSiteSettings } from "@/server/queries/taxonomy";

export const metadata = { title: "Website settings" };

export default async function SettingsPage() {
  await requireUser("settings.manage");
  const s = await getSiteSettings();
  const keys: (keyof SettingsValues)[] = [
    "siteName",
    "siteNameKm",
    "tagline",
    "taglineKm",
    "description",
    "descriptionKm",
    "contactEmail",
    "contactPhone",
    "address",
    "addressKm",
    "facebookUrl",
    "telegramUrl",
    "youtubeUrl",
    "linkedinUrl",
    "footerNote",
    "footerNoteKm",
  ];
  const initial = Object.fromEntries(keys.map((k) => [k, s[k] ?? ""])) as SettingsValues;
  return (
    <>
      <AdminPageHeader title="Website settings" />
      <SettingsForm initial={initial} />
    </>
  );
}

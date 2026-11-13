import Link from "next/link";
import { AdminPageHeader, Notice } from "@/components/admin/admin-table";
import { requireUser } from "@/lib/auth/guard";
import { adminListForms } from "@/server/admin/journeys";

export const metadata = { title: "Forms" };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireUser("forms.manage");
  const forms = await adminListForms();
  return (
    <>
      <AdminPageHeader
        title="Forms"
        description="Journey request forms. Only signed-in members can submit."
        action={{ href: "/admin/forms/new", label: "New form" }}
      />
      <Notice params={await searchParams} />
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-canvas text-left text-xs text-muted">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Form
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Journey
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Fields
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Submissions
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {forms.map((f) => (
              <tr key={f.id} className="hover:bg-canvas/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/forms/${f.id}`} className="font-medium text-ink hover:text-brand">
                    {f.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-soft">{f.journey?.title ?? "—"}</td>
                <td className="px-4 py-3">{f._count.fields}</td>
                <td className="px-4 py-3">{f._count.submissions}</td>
                <td className="px-4 py-3">
                  {f.isActive ? (
                    <span className="text-success">Active</span>
                  ) : (
                    <span className="text-muted">Inactive</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {forms.length === 0 && <p className="p-10 text-center text-sm text-muted">No forms yet.</p>}
      </div>
    </>
  );
}

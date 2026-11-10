import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/article-form";
import { AdminPageHeader, Notice } from "@/components/admin/admin-table";
import { can, canEditRecord, requireUser } from "@/lib/auth/guard";
import {
  loadArticleForm,
  categoryIdOptions,
  organizationOptions,
  personOptions,
  tagIdOptions,
} from "@/server/admin/queries";

export const metadata = { title: "Edit article" };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const data = await loadArticleForm(id);
  if (!data) notFound();

  if (!canEditRecord(user, data.record)) {
    return (
      <>
        <AdminPageHeader title={data.name} />
        <p className="card p-6 text-sm text-ink-soft">
          You can view but not edit this article.{" "}
          <Link href={`/admin/preview/article/${id}`} className="text-brand underline">
            Open preview
          </Link>
        </p>
      </>
    );
  }

  const [categories, tags, people, organizations] = await Promise.all([
    categoryIdOptions("ARTICLE"),
    tagIdOptions(),
    personOptions(),
    organizationOptions(),
  ]);
  const options = { categories, tags, people, organizations };

  return (
    <>
      <AdminPageHeader title={data.name || "Edit article"} />
      <Notice params={await searchParams} />
      <ArticleForm
        key={data.meta.updatedAt}
        id={id}
        initial={data.values}
        options={options}
        canPublish={can(user, "content.publish")}
        canDelete={can(user, "content.delete")}
        meta={data.meta}
      />
    </>
  );
}

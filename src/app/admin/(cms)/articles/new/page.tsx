import { ArticleForm, type ArticleFormValues } from "@/components/admin/article-form";
import { emptyArticleTr } from "@/components/admin/form-defaults";
import { AdminPageHeader } from "@/components/admin/admin-table";
import { can, requireUser } from "@/lib/auth/guard";
import { categoryIdOptions, organizationOptions, personOptions, tagIdOptions } from "@/server/admin/queries";

export const metadata = { title: "New article" };

export default async function Page() {
  const user = await requireUser("content.create");
  const [categories, tags, people, organizations] = await Promise.all([
    categoryIdOptions("ARTICLE"),
    tagIdOptions(),
    personOptions(),
    organizationOptions(),
  ]);
  const options = { categories, tags, people, organizations };
  const initial: ArticleFormValues = {
    slug: "",
    status: "DRAFT",
    isFeatured: false,
    sortOrder: 0,
    featuredImage: null,
    categoryId: "",
    authorPersonId: "",
    tagIds: [],
    personIds: [],
    organizationIds: [],
    translations: { en: { ...emptyArticleTr }, km: { ...emptyArticleTr } },
  };

  return (
    <>
      <AdminPageHeader title="New article" />
      <ArticleForm
        id={null}
        initial={initial}
        options={options}
        canPublish={can(user, "content.publish")}
        canDelete={false}
      />
    </>
  );
}

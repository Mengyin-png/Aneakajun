// Empty bilingual blocks for the content editors. Kept out of the "use client"
// form modules: values imported from a client module into a server component
// become client references, not plain objects.
export const emptyPersonTr = { name: "", headline: "", bio: "", seoTitle: "", seoDescription: "" };
export const emptyOrgTr = {
  name: "",
  tagline: "",
  description: "",
  mission: "",
  vision: "",
  activities: "",
  address: "",
  seoTitle: "",
  seoDescription: "",
};
export const emptyArticleTr = { title: "", excerpt: "", body: "", seoTitle: "", seoDescription: "" };

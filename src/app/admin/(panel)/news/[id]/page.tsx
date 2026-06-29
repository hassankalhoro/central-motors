import { notFound } from "next/navigation";
import { getNewsPost } from "@/server/services/newsService";
import { PageHeader } from "@/components/admin/ui";
import NewsForm from "@/components/admin/NewsForm";

export default async function EditNewsPage({ params }: { params: { id: string } }) {
  const post = await getNewsPost(params.id);
  if (!post) notFound();

  return (
    <>
      <PageHeader title="Edit Post" subtitle={post.title} />
      <NewsForm
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          body: post.body ?? "",
          imageUrl: post.imageUrl ?? "",
          imagePublicId: post.imagePublicId ?? "",
          published: post.published,
        }}
      />
    </>
  );
}

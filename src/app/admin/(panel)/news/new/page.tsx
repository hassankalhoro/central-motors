import { PageHeader } from "@/components/admin/ui";
import NewsForm from "@/components/admin/NewsForm";

export default function NewNewsPage() {
  return (
    <>
      <PageHeader title="New Post" subtitle="Write a news article or announcement" />
      <NewsForm />
    </>
  );
}

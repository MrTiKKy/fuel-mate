import { DocumentDetailPageClient } from "@/features/documents";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: "Document",
};

export default async function DocumentDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <DocumentDetailPageClient documentId={id} />;
}

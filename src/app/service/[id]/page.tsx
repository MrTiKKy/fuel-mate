import { ServiceDetailPageClient } from "@/features/service";

export const metadata = {
  title: "Service Record",
};

type ServiceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { id } = await params;
  return <ServiceDetailPageClient recordId={id} />;
}

import { FuelDetailPageClient } from "@/features/fuel";

export const metadata = {
  title: "Fuel Entry",
};

type FuelDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function FuelDetailPage({ params }: FuelDetailPageProps) {
  const { id } = await params;
  return <FuelDetailPageClient entryId={id} />;
}

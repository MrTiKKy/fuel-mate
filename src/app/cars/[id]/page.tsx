import { CarDetailPageClient } from "@/features/cars";

export const metadata = {
  title: "Vehicle",
};

type CarDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const { id } = await params;
  return <CarDetailPageClient carId={id} />;
}

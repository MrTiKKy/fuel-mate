import { MaintenanceCostCalculator } from "@/features/calculators";

export const metadata = {
  title: "Maintenance cost",
};

export default function MaintenanceCostPage() {
  return <MaintenanceCostCalculator />;
}

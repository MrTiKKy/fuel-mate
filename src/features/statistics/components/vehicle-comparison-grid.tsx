import { formatCurrency, formatDistance, formatNumber } from "@/lib/formatters";
import type { VehicleComparison } from "@/features/statistics/services/series";

type VehicleComparisonGridProps = {
  comparisons: VehicleComparison[];
};

export function VehicleComparisonGrid({
  comparisons,
}: VehicleComparisonGridProps) {
  if (comparisons.length < 2) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {comparisons.map((row) => (
        <div
          key={row.carId}
          className="rounded-2xl border border-border/70 bg-card p-4"
        >
          <h3 className="text-sm font-semibold tracking-tight">{row.name}</h3>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <Metric
              label="Consumption"
              value={
                row.stats.averageConsumption > 0
                  ? `${row.stats.averageConsumption.toFixed(2)} L/100km`
                  : "—"
              }
            />
            <Metric
              label="Fuel cost"
              value={formatCurrency(row.stats.totalFuelCost)}
            />
            <Metric
              label="Distance"
              value={formatDistance(row.stats.distanceTravelled)}
            />
            <Metric
              label="Fuel stops"
              value={formatNumber(row.stops, "en-US", 0)}
            />
          </dl>
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 px-2.5 py-2">
      <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 font-medium text-foreground">{value}</dd>
    </div>
  );
}

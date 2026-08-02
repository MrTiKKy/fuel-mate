"use client";

import { getCarDisplayName } from "@/features/cars/utils";
import {
  PERIOD_OPTIONS,
  type StatsFilters,
  type StatsPeriod,
} from "@/features/statistics/services/filters";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Car } from "@/types";

type StatsFiltersBarProps = {
  cars: Car[];
  filters: StatsFilters;
  onChange: (partial: Partial<StatsFilters>) => void;
};

export function StatsFiltersBar({
  cars,
  filters,
  onChange,
}: StatsFiltersBarProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Vehicle
          </label>
          <Select
            value={filters.carId}
            onValueChange={(value) =>
              onChange({ carId: value as StatsFilters["carId"] })
            }
          >
            <SelectTrigger className="h-11 w-full rounded-xl">
              <SelectValue placeholder="All vehicles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vehicles</SelectItem>
              {cars.map((car) => (
                <SelectItem key={car.id} value={car.id}>
                  {getCarDisplayName(car)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Period
          </label>
          <Select
            value={filters.period}
            onValueChange={(value) =>
              onChange({ period: value as StatsPeriod })
            }
          >
            <SelectTrigger className="h-11 w-full rounded-xl">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filters.period === "custom" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              From
            </label>
            <Input
              type="date"
              className="h-11 rounded-xl"
              value={filters.customFrom ?? ""}
              onChange={(event) =>
                onChange({ customFrom: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              To
            </label>
            <Input
              type="date"
              className="h-11 rounded-xl"
              value={filters.customTo ?? ""}
              onChange={(event) => onChange({ customTo: event.target.value })}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

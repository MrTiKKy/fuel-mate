"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SERVICE_TYPE_OPTIONS } from "@/features/service/constants";
import type { ServiceFilters } from "@/features/service/selectors";
import { getCarDisplayName } from "@/features/cars/utils";
import type { Car, ServiceStatus, ServiceType } from "@/types";

type ServiceFiltersBarProps = {
  cars: Car[];
  filters: ServiceFilters;
  onChange: (partial: Partial<ServiceFilters>) => void;
};

export function ServiceFiltersBar({
  cars,
  filters,
  onChange,
}: ServiceFiltersBarProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
      <Input
        value={filters.query}
        onChange={(event) => onChange({ query: event.target.value })}
        placeholder="Search garage, title, notes…"
        className="h-11 rounded-xl"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          value={filters.carId}
          onValueChange={(value) =>
            onChange({ carId: value as ServiceFilters["carId"] })
          }
        >
          <SelectTrigger className="h-11 w-full rounded-xl">
            <SelectValue placeholder="Vehicle" />
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

        <Select
          value={filters.type}
          onValueChange={(value) =>
            onChange({ type: value as ServiceType | "all" })
          }
        >
          <SelectTrigger className="h-11 w-full rounded-xl">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">All types</SelectItem>
            {SERVICE_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) =>
            onChange({ status: value as ServiceStatus | "all" })
          }
        >
          <SelectTrigger className="h-11 w-full rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="due_soon">Due soon</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            className="h-11 rounded-xl"
            value={filters.dateFrom ?? ""}
            onChange={(event) => onChange({ dateFrom: event.target.value })}
            aria-label="From date"
          />
          <Input
            type="date"
            className="h-11 rounded-xl"
            value={filters.dateTo ?? ""}
            onChange={(event) => onChange({ dateTo: event.target.value })}
            aria-label="To date"
          />
        </div>
      </div>
    </div>
  );
}

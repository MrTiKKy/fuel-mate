"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/features/statistics/components/chart-card";
import type {
  ConsumptionTrendPoint,
  CostByVehiclePoint,
  MonthSeriesPoint,
} from "@/features/statistics/services/series";
import { formatCurrency, formatNumber } from "@/lib/formatters";

const CHART_PRIMARY = "oklch(0.72 0.13 195)";
const CHART_SECONDARY = "oklch(0.7 0.14 145)";
const CHART_MUTED = "oklch(0.55 0.02 255)";
const PIE_COLORS = [
  "oklch(0.72 0.13 195)",
  "oklch(0.7 0.14 145)",
  "oklch(0.75 0.12 85)",
  "oklch(0.68 0.16 30)",
  "oklch(0.65 0.12 280)",
];

const tooltipStyle = {
  backgroundColor: "oklch(0.16 0.014 255)",
  border: "1px solid oklch(0.24 0.016 255)",
  borderRadius: "12px",
  fontSize: "12px",
};

type StatsChartsProps = {
  monthly: MonthSeriesPoint[];
  consumptionTrend: ConsumptionTrendPoint[];
  costByVehicle: CostByVehiclePoint[];
};

export function StatsCharts({
  monthly,
  consumptionTrend,
  costByVehicle,
}: StatsChartsProps) {
  return (
    <div className="space-y-4">
      <ChartCard
        title="Fuel cost per month"
        description="Total spend by month"
        empty={monthly.length === 0}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_MUTED} opacity={0.25} />
            <XAxis dataKey="label" tick={{ fill: CHART_MUTED, fontSize: 11 }} />
            <YAxis tick={{ fill: CHART_MUTED, fontSize: 11 }} width={40} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [
                formatCurrency(Number(value ?? 0)),
                "Cost",
              ]}
            />
            <Bar dataKey="fuelCost" fill={CHART_PRIMARY} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Distance per month"
        description="Odometer span in each month"
        empty={monthly.every((m) => m.distance === 0)}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthly}>
            <defs>
              <linearGradient id="distanceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_PRIMARY} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_PRIMARY} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_MUTED} opacity={0.25} />
            <XAxis dataKey="label" tick={{ fill: CHART_MUTED, fontSize: 11 }} />
            <YAxis tick={{ fill: CHART_MUTED, fontSize: 11 }} width={40} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [
                `${formatNumber(Number(value ?? 0), "en-US", 0)} km`,
                "Distance",
              ]}
            />
            <Area
              type="monotone"
              dataKey="distance"
              stroke={CHART_PRIMARY}
              fill="url(#distanceFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Average consumption"
        description="Full-tank readings over time"
        empty={consumptionTrend.length < 2}
        emptyMessage="Need at least two full-tank readings"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={consumptionTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_MUTED} opacity={0.25} />
            <XAxis dataKey="label" tick={{ fill: CHART_MUTED, fontSize: 11 }} />
            <YAxis tick={{ fill: CHART_MUTED, fontSize: 11 }} width={36} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [
                `${Number(value ?? 0).toFixed(2)} L/100km`,
                "Consumption",
              ]}
            />
            <Line
              type="monotone"
              dataKey="consumption"
              stroke={CHART_SECONDARY}
              strokeWidth={2.5}
              dot={{ r: 3, fill: CHART_SECONDARY }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Fuel price"
        description="Average price paid each month"
        empty={monthly.every((m) => m.avgPrice === 0)}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_MUTED} opacity={0.25} />
            <XAxis dataKey="label" tick={{ fill: CHART_MUTED, fontSize: 11 }} />
            <YAxis tick={{ fill: CHART_MUTED, fontSize: 11 }} width={40} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [
                formatCurrency(Number(value ?? 0)),
                "Avg / L",
              ]}
            />
            <Line
              type="monotone"
              dataKey="avgPrice"
              stroke={CHART_PRIMARY}
              strokeWidth={2.5}
              dot={{ r: 3, fill: CHART_PRIMARY }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Liters purchased"
        description="Volume by month"
        empty={monthly.every((m) => m.liters === 0)}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_MUTED} opacity={0.25} />
            <XAxis dataKey="label" tick={{ fill: CHART_MUTED, fontSize: 11 }} />
            <YAxis tick={{ fill: CHART_MUTED, fontSize: 11 }} width={40} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [
                `${formatNumber(Number(value ?? 0), "en-US", 1)} L`,
                "Liters",
              ]}
            />
            <Bar dataKey="liters" fill={CHART_SECONDARY} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Cost distribution"
        description="Fuel cost by vehicle"
        empty={costByVehicle.length === 0}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={costByVehicle}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={78}
              paddingAngle={3}
            >
              {costByVehicle.map((entry, index) => (
                <Cell
                  key={entry.carId}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => [
                formatCurrency(Number(value ?? 0)),
                String(name),
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

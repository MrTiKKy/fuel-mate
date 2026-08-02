import { formatCurrency } from "@/lib/formatters";
import { computeFuelStats } from "@/features/fuel/utils";
import { registerInsightRule } from "@/features/insights/engine/registry";
import type { InsightContext } from "@/features/insights/engine/types";
import type { Insight } from "@/types";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function entriesInMonth(ctx: InsightContext, offsetMonths: number) {
  const ref = new Date(ctx.now);
  ref.setMonth(ref.getMonth() + offsetMonths);
  const key = monthKey(ref);
  return ctx.fuelEntries.filter((entry) => {
    const d = new Date(entry.date);
    return monthKey(d) === key;
  });
}

function makeInsight(
  id: string,
  category: Insight["category"],
  title: string,
  description: string,
  severity: Insight["severity"],
  now: Date,
): Insight {
  return {
    id,
    category,
    title,
    description,
    severity,
    createdAt: now.toISOString(),
  };
}

registerInsightRule({
  id: "fuel-spend-mom",
  category: "fuel",
  evaluate(ctx) {
    const thisMonth = entriesInMonth(ctx, 0);
    const lastMonth = entriesInMonth(ctx, -1);
    if (thisMonth.length < 2 || lastMonth.length < 2) return null;

    const current = computeFuelStats(thisMonth).totalFuelCost;
    const previous = computeFuelStats(lastMonth).totalFuelCost;
    if (previous <= 0) return null;

    const delta = ((current - previous) / previous) * 100;
    if (Math.abs(delta) < 5) return null;

    const up = delta > 0;
    return makeInsight(
      "fuel-spend-mom",
      "fuel",
      `Fuel expenses ${up ? "increased" : "decreased"} by ${Math.abs(delta).toFixed(0)}% compared to last month.`,
      `${formatCurrency(current, ctx.currency)} this month vs ${formatCurrency(previous, ctx.currency)} last month.`,
      up ? "warning" : "positive",
      ctx.now,
    );
  },
});

registerInsightRule({
  id: "fuel-price-trend",
  category: "fuel",
  evaluate(ctx) {
    const thisMonth = entriesInMonth(ctx, 0);
    const lastMonth = entriesInMonth(ctx, -1);
    if (thisMonth.length < 2 || lastMonth.length < 2) return null;

    const avg = (entries: typeof thisMonth) =>
      entries.reduce((sum, e) => sum + e.pricePerLiter, 0) / entries.length;

    const current = avg(thisMonth);
    const previous = avg(lastMonth);
    if (previous <= 0) return null;
    const delta = ((current - previous) / previous) * 100;
    if (Math.abs(delta) < 3) return null;

    const lower = delta < 0;
    return makeInsight(
      "fuel-price-trend",
      "fuel",
      `Your average fuel price is ${lower ? "lower" : "higher"} than last month.`,
      `${formatCurrency(current, ctx.currency)}/L vs ${formatCurrency(previous, ctx.currency)}/L.`,
      lower ? "positive" : "info",
      ctx.now,
    );
  },
});

registerInsightRule({
  id: "fuel-consumption-improved",
  category: "driving",
  evaluate(ctx) {
    const withConsumption = ctx.fuelEntries.filter(
      (e) => e.consumption && e.consumption > 0,
    );
    if (withConsumption.length < 6) return null;

    const sorted = [...withConsumption].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const half = Math.floor(sorted.length / 2);
    const older = sorted.slice(0, half);
    const newer = sorted.slice(half);
    const avg = (list: typeof sorted) =>
      list.reduce((sum, e) => sum + (e.consumption ?? 0), 0) / list.length;

    const oldAvg = avg(older);
    const newAvg = avg(newer);
    if (oldAvg <= 0) return null;
    const improvement = ((oldAvg - newAvg) / oldAvg) * 100;
    if (improvement < 4) return null;

    return makeInsight(
      "fuel-consumption-improved",
      "driving",
      "Fuel consumption has improved.",
      `Average dropped from ${oldAvg.toFixed(1)} to ${newAvg.toFixed(1)} L/100km.`,
      "positive",
      ctx.now,
    );
  },
});

registerInsightRule({
  id: "maintenance-gap",
  category: "maintenance",
  evaluate(ctx) {
    if (ctx.serviceRecords.length === 0) {
      if (ctx.fuelEntries.length < 10) return null;
      return makeInsight(
        "maintenance-gap",
        "maintenance",
        "No maintenance has been recorded yet.",
        "Log oil changes, ITP and tyres to track vehicle health.",
        "warning",
        ctx.now,
      );
    }

    const latest = [...ctx.serviceRecords].sort(
      (a, b) =>
        new Date(b.dateCompleted).getTime() -
        new Date(a.dateCompleted).getTime(),
    )[0];
    const months =
      (ctx.now.getTime() - new Date(latest.dateCompleted).getTime()) /
      (1000 * 60 * 60 * 24 * 30);
    if (months < 10) return null;

    return makeInsight(
      "maintenance-gap",
      "maintenance",
      `No maintenance has been recorded in the last ${Math.floor(months)} months.`,
      "Consider scheduling an inspection or oil service.",
      "warning",
      ctx.now,
    );
  },
});

registerInsightRule({
  id: "maintenance-above-average",
  category: "maintenance",
  evaluate(ctx) {
    if (ctx.serviceRecords.length < 4) return null;
    const year = ctx.now.getFullYear();
    const thisYear = ctx.serviceRecords.filter(
      (r) => new Date(r.dateCompleted).getFullYear() === year,
    );
    if (thisYear.length < 2) return null;

    const total = ctx.serviceRecords.reduce((sum, r) => sum + r.cost, 0);
    const years = new Set(
      ctx.serviceRecords.map((r) => new Date(r.dateCompleted).getFullYear()),
    ).size;
    const yearlyAvg = total / Math.max(1, years);
    const ytd = thisYear.reduce((sum, r) => sum + r.cost, 0);
    if (yearlyAvg <= 0 || ytd <= yearlyAvg * 1.1) return null;

    return makeInsight(
      "maintenance-above-average",
      "maintenance",
      "Maintenance costs are above your yearly average.",
      `${formatCurrency(ytd, ctx.currency)} this year vs ${formatCurrency(yearlyAvg, ctx.currency)} average.`,
      "warning",
      ctx.now,
    );
  },
});

registerInsightRule({
  id: "tyres-age",
  category: "vehicle_health",
  evaluate(ctx) {
    const tyreJobs = ctx.serviceRecords.filter((r) => r.type === "tyres");
    if (tyreJobs.length === 0) {
      if (ctx.serviceRecords.length < 3) return null;
      return makeInsight(
        "tyres-age",
        "vehicle_health",
        "No tyre service has been logged yet.",
        "Track tyre replacements for safer long-term ownership.",
        "info",
        ctx.now,
      );
    }
    const latest = [...tyreJobs].sort(
      (a, b) =>
        new Date(b.dateCompleted).getTime() -
        new Date(a.dateCompleted).getTime(),
    )[0];
    const years =
      (ctx.now.getTime() - new Date(latest.dateCompleted).getTime()) /
      (1000 * 60 * 60 * 24 * 365);
    if (years < 4) return null;
    return makeInsight(
      "tyres-age",
      "vehicle_health",
      "Tyres have not been replaced in over 4 years.",
      "Consider inspecting tread and age-related wear.",
      "critical",
      ctx.now,
    );
  },
});

registerInsightRule({
  id: "expenses-below-average",
  category: "expenses",
  evaluate(ctx) {
    const thisMonthFuel = computeFuelStats(entriesInMonth(ctx, 0)).totalFuelCost;
    const thisMonthService = ctx.serviceRecords
      .filter((r) => {
        const d = new Date(r.dateCompleted);
        return (
          d.getFullYear() === ctx.now.getFullYear() &&
          d.getMonth() === ctx.now.getMonth()
        );
      })
      .reduce((sum, r) => sum + r.cost, 0);
    const current = thisMonthFuel + thisMonthService;

    const months = new Map<string, number>();
    for (const entry of ctx.fuelEntries) {
      const d = new Date(entry.date);
      const key = monthKey(d);
      months.set(key, (months.get(key) ?? 0) + entry.totalCost);
    }
    for (const record of ctx.serviceRecords) {
      const d = new Date(record.dateCompleted);
      const key = monthKey(d);
      months.set(key, (months.get(key) ?? 0) + record.cost);
    }
    if (months.size < 3) return null;
    const values = [...months.values()];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    if (avg <= 0 || current >= avg * 0.92) return null;

    return makeInsight(
      "expenses-below-average",
      "expenses",
      "This month's expenses are below your average.",
      `${formatCurrency(current, ctx.currency)} vs ${formatCurrency(avg, ctx.currency)} monthly average.`,
      "positive",
      ctx.now,
    );
  },
});

registerInsightRule({
  id: "ownership-cost-up",
  category: "expenses",
  evaluate(ctx) {
    const thisMonth = entriesInMonth(ctx, 0);
    const lastMonth = entriesInMonth(ctx, -1);
    if (thisMonth.length + lastMonth.length < 6) return null;

    const costFor = (offset: number) => {
      const fuel = computeFuelStats(entriesInMonth(ctx, offset)).totalFuelCost;
      const ref = new Date(ctx.now);
      ref.setMonth(ref.getMonth() + offset);
      const service = ctx.serviceRecords
        .filter((r) => {
          const d = new Date(r.dateCompleted);
          return (
            d.getFullYear() === ref.getFullYear() &&
            d.getMonth() === ref.getMonth()
          );
        })
        .reduce((sum, r) => sum + r.cost, 0);
      return fuel + service;
    };

    const current = costFor(0);
    const previous = costFor(-1);
    if (previous <= 0) return null;
    const delta = ((current - previous) / previous) * 100;
    if (delta < 9) return null;

    return makeInsight(
      "ownership-cost-up",
      "expenses",
      `Vehicle ownership cost has increased by ${delta.toFixed(0)}%.`,
      "Fuel and maintenance combined versus last month.",
      "warning",
      ctx.now,
    );
  },
});

registerInsightRule({
  id: "document-insurance-soon",
  category: "documents",
  evaluate(ctx) {
    const insurance = ctx.documents.filter(
      (d) =>
        (d.type === "insurance_rca" || d.type === "casco") && d.expiryDate,
    );
    if (insurance.length === 0) return null;

    const soon = insurance
      .map((d) => ({
        doc: d,
        days: Math.round(
          (new Date(d.expiryDate!).getTime() - ctx.now.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      }))
      .filter((item) => item.days <= 30)
      .sort((a, b) => a.days - b.days)[0];

    if (!soon) return null;

    return makeInsight(
      "document-insurance-soon",
      "documents",
      soon.days < 0
        ? "Insurance has expired."
        : "Insurance renewal is approaching.",
      soon.days < 0
        ? `${soon.doc.title} expired ${Math.abs(soon.days)} days ago.`
        : `${soon.doc.title} expires in ${soon.days} days.`,
      soon.days < 0 ? "critical" : "warning",
      ctx.now,
    );
  },
});

registerInsightRule({
  id: "document-itp-soon",
  category: "documents",
  evaluate(ctx) {
    const itp = ctx.documents.filter((d) => d.type === "itp" && d.expiryDate);
    if (itp.length === 0) return null;
    const soon = itp
      .map((d) => ({
        doc: d,
        days: Math.round(
          (new Date(d.expiryDate!).getTime() - ctx.now.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      }))
      .filter((item) => item.days <= 45)
      .sort((a, b) => a.days - b.days)[0];
    if (!soon) return null;
    return makeInsight(
      "document-itp-soon",
      "documents",
      soon.days < 0 ? "ITP has expired." : "ITP expires soon.",
      soon.days < 0
        ? `${soon.doc.title} expired ${Math.abs(soon.days)} days ago.`
        : `${soon.doc.title} expires in ${soon.days} days.`,
      soon.days < 0 ? "critical" : "warning",
      ctx.now,
    );
  },
});

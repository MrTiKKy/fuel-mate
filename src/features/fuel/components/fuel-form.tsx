"use client";

import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DecimalInput } from "@/components/shared/decimal-input";
import { FUEL_TYPE_OPTIONS } from "@/features/cars/constants";
import { getCarDisplayName } from "@/features/cars/utils";
import {
  fuelEntryFormSchema,
  roundMoney,
  roundPrice,
  type FuelEntryFormValues,
} from "@/lib/validations/fuel";
import { parseLocaleNumber } from "@/lib/numbers";
import { cn } from "@/lib/utils";
import type { Car } from "@/types";
import { Input } from "@/components/ui/input";

const fieldClass =
  "h-12 rounded-2xl border-border/80 bg-muted/40 px-4 text-base md:text-base";

type FuelFormProps = {
  cars: Car[];
  defaultValues?: Partial<FuelEntryFormValues>;
  submitLabel?: string;
  onSubmit: (values: FuelEntryFormValues) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
};

export function FuelForm({
  cars,
  defaultValues,
  submitLabel = "Save entry",
  onSubmit,
  onCancel,
  isSubmitting = false,
}: FuelFormProps) {
  const lastEdited = useRef<"liters" | "price" | "total" | null>(null);

  const form = useForm<FuelEntryFormValues>({
    resolver: zodResolver(fuelEntryFormSchema),
    defaultValues: {
      carId: defaultValues?.carId ?? cars[0]?.id ?? "",
      date: defaultValues?.date ?? new Date().toISOString().slice(0, 10),
      distanceSinceLastRefuel: defaultValues?.distanceSinceLastRefuel ?? "",
      liters: defaultValues?.liters ?? "",
      pricePerLiter: defaultValues?.pricePerLiter ?? "",
      totalCost: defaultValues?.totalCost ?? "",
      fuelType: defaultValues?.fuelType ?? cars[0]?.fuelType ?? "petrol",
      isFullTank: defaultValues?.isFullTank ?? true,
      notes: defaultValues?.notes ?? "",
    },
    mode: "onSubmit",
  });

  const liters = useWatch({ control: form.control, name: "liters" });
  const pricePerLiter = useWatch({
    control: form.control,
    name: "pricePerLiter",
  });
  const totalCost = useWatch({ control: form.control, name: "totalCost" });
  const carId = useWatch({ control: form.control, name: "carId" });

  useEffect(() => {
    const L = parseLocaleNumber(liters);
    const P = parseLocaleNumber(pricePerLiter);
    const T = parseLocaleNumber(totalCost);
    if (!Number.isFinite(L) || L <= 0) return;

    if (
      (lastEdited.current === "liters" || lastEdited.current === "price") &&
      Number.isFinite(P) &&
      P > 0
    ) {
      form.setValue("totalCost", roundMoney(L * P).toFixed(2), {
        shouldValidate: false,
        shouldDirty: true,
      });
    } else if (lastEdited.current === "total" && Number.isFinite(T) && T > 0) {
      form.setValue("pricePerLiter", roundPrice(T / L).toFixed(3), {
        shouldValidate: false,
        shouldDirty: true,
      });
    }
  }, [liters, pricePerLiter, totalCost, form]);

  useEffect(() => {
    const car = cars.find((c) => c.id === carId);
    if (car && !defaultValues?.fuelType) {
      form.setValue("fuelType", car.fuelType);
    }
  }, [carId, cars, form, defaultValues?.fuelType]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => onSubmit(values))}
        className="flex flex-col gap-5"
      >
        <section className="space-y-4">
          <FormSectionTitle>Fill-up</FormSectionTitle>

          <FormField
            control={form.control}
            name="carId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={cn(fieldClass, "w-full")}>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cars.map((car) => (
                      <SelectItem key={car.id} value={car.id}>
                        {getCarDisplayName(car)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" className={fieldClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="distanceSinceLastRefuel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distance since last refuel</FormLabel>
                <FormControl>
                  <DecimalInput
                    placeholder="e.g. 450"
                    className={fieldClass}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Kilometers driven since the previous fill-up
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="liters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuel amount</FormLabel>
                  <FormControl>
                    <DecimalInput
                      placeholder="34,00"
                      className={fieldClass}
                      value={field.value}
                      onChange={(value) => {
                        lastEdited.current = "liters";
                        field.onChange(value);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pricePerLiter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price / L</FormLabel>
                  <FormControl>
                    <DecimalInput
                      placeholder="7,49"
                      className={fieldClass}
                      value={field.value}
                      onChange={(value) => {
                        lastEdited.current = "price";
                        field.onChange(value);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="totalCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total cost</FormLabel>
                <FormControl>
                  <DecimalInput
                    placeholder="Auto-calculated"
                    className={fieldClass}
                    value={field.value}
                    onChange={(value) => {
                      lastEdited.current = "total";
                      field.onChange(value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-4">
          <FormSectionTitle>Details</FormSectionTitle>

          <FormField
            control={form.control}
            name="fuelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuel type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={cn(fieldClass, "w-full")}>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FUEL_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isFullTank"
            render={({ field }) => (
              <FormItem className="flex min-h-14 items-center justify-between rounded-2xl border border-border/70 bg-card/80 px-4 py-3.5">
                <div>
                  <FormLabel className="text-sm font-medium">Full tank</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Enables consumption calculation
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="h-6 w-11"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Optional notes…"
                    className="min-h-24 rounded-2xl border-border/80 bg-muted/40 px-4 py-3 text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <div className="sticky bottom-0 -mx-1 flex gap-3 bg-background/95 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1 rounded-2xl"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          ) : null}
          <Button
            type="submit"
            className="h-12 flex-1 rounded-2xl"
            disabled={isSubmitting || cars.length === 0}
            loading={isSubmitting}
          >
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function FormSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
      {children}
    </h3>
  );
}

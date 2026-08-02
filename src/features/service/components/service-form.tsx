"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SERVICE_TYPE_OPTIONS } from "@/features/service/constants";
import { getCarDisplayName } from "@/features/cars/utils";
import {
  serviceFormSchema,
  type ServiceFormValues,
} from "@/lib/validations/service";
import { cn } from "@/lib/utils";
import type { Car } from "@/types";

const fieldClass =
  "h-12 rounded-xl border-border/80 bg-muted/40 px-4 text-base md:text-base";

type ServiceFormProps = {
  cars: Car[];
  defaultValues?: Partial<ServiceFormValues>;
  submitLabel?: string;
  onSubmit: (values: ServiceFormValues) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
};

export function ServiceForm({
  cars,
  defaultValues,
  submitLabel = "Save service",
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ServiceFormProps) {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      carId: defaultValues?.carId ?? cars[0]?.id ?? "",
      type: defaultValues?.type ?? "oil_change",
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      dateCompleted:
        defaultValues?.dateCompleted ?? new Date().toISOString().slice(0, 10),
      odometerCompleted: defaultValues?.odometerCompleted ?? "",
      nextDate: defaultValues?.nextDate ?? "",
      nextOdometer: defaultValues?.nextOdometer ?? "",
      cost: defaultValues?.cost ?? "",
      garageName: defaultValues?.garageName ?? "",
      invoiceNumber: defaultValues?.invoiceNumber ?? "",
      notes: defaultValues?.notes ?? "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => onSubmit(values))}
        className="flex flex-col gap-5"
      >
        <section className="space-y-4">
          <SectionTitle>General</SectionTitle>

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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    const label = SERVICE_TYPE_OPTIONS.find(
                      (o) => o.value === value,
                    )?.label;
                    if (label && !form.getValues("title")) {
                      form.setValue("title", label);
                    }
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className={cn(fieldClass, "w-full")}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-72">
                    {SERVICE_TYPE_OPTIONS.map((option) => (
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Oil change + filter"
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Optional details…"
                    className="min-h-20 rounded-xl border-border/80 bg-muted/40 px-4 py-3 text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-4">
          <SectionTitle>Completed</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="dateCompleted"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date completed</FormLabel>
                  <FormControl>
                    <Input type="date" className={fieldClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="odometerCompleted"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Odometer (km)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="100000"
                      className={fieldClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>Next reminder</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="nextDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next date</FormLabel>
                  <FormControl>
                    <Input type="date" className={fieldClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nextOdometer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next odometer</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="115000"
                      className={fieldClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>Cost & garage</SectionTitle>
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    placeholder="0.00"
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="garageName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Garage</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Service center"
                      className={fieldClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice #</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Optional"
                      className={fieldClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Anything to remember…"
                    className="min-h-24 rounded-xl border-border/80 bg-muted/40 px-4 py-3 text-base"
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
              className="h-12 flex-1 rounded-xl"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          ) : null}
          <Button
            type="submit"
            className="h-12 flex-1 rounded-xl"
            disabled={isSubmitting || cars.length === 0}
          >
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
      {children}
    </h3>
  );
}

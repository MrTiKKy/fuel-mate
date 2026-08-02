"use client";

import { useEffect } from "react";
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
import { Input } from "@/components/ui/input";
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
import { SERVICE_TYPE_OPTIONS } from "@/features/service/constants";
import { getServiceTypeLabel } from "@/features/service/utils";
import { getCarDisplayName } from "@/features/cars/utils";
import {
  serviceFormSchema,
  type ServiceFormValues,
} from "@/lib/validations/service";
import { cn } from "@/lib/utils";
import type { Car } from "@/types";

const fieldClass =
  "h-12 rounded-2xl border-border/80 bg-muted/40 px-4 text-base md:text-base";

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
  submitLabel = "Save service entry",
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ServiceFormProps) {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      carId: defaultValues?.carId ?? cars[0]?.id ?? "",
      type: defaultValues?.type ?? "oil_change",
      title:
        defaultValues?.title ??
        getServiceTypeLabel(defaultValues?.type ?? "oil_change"),
      dateCompleted:
        defaultValues?.dateCompleted ?? new Date().toISOString().slice(0, 10),
      cost: defaultValues?.cost ?? "",
      notes: defaultValues?.notes ?? "",
      reminderEnabled: defaultValues?.reminderEnabled ?? false,
      repeatInterval: defaultValues?.repeatInterval ?? "12",
      repeatUnit: defaultValues?.repeatUnit ?? "months",
    },
  });

  const type = useWatch({ control: form.control, name: "type" });
  const reminderEnabled = useWatch({
    control: form.control,
    name: "reminderEnabled",
  });

  useEffect(() => {
    if (!defaultValues?.title) {
      form.setValue("title", getServiceTypeLabel(type));
    }
  }, [type, form, defaultValues?.title]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => onSubmit(values))}
        className="flex flex-col gap-5"
      >
        <section className="space-y-4">
          <SectionTitle>Service entry</SectionTitle>

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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={cn(fieldClass, "w-full")}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
                  <Input className={fieldClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
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
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost</FormLabel>
                  <FormControl>
                    <DecimalInput
                      placeholder="0"
                      className={fieldClass}
                      value={field.value}
                      onChange={field.onChange}
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

        <section className="space-y-4">
          <SectionTitle>Reminder</SectionTitle>

          <FormField
            control={form.control}
            name="reminderEnabled"
            render={({ field }) => (
              <FormItem className="flex min-h-14 items-center justify-between rounded-2xl border border-border/70 bg-card/80 px-4 py-3.5">
                <div>
                  <FormLabel className="text-sm font-medium">
                    Enable reminder
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Notify when this service is due again
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

          {reminderEnabled ? (
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="repeatInterval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repeat every</FormLabel>
                    <FormControl>
                      <DecimalInput
                        placeholder="12"
                        className={fieldClass}
                        value={field.value}
                        onChange={field.onChange}
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
                name="repeatUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repeat by</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={cn(fieldClass, "w-full")}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                        <SelectItem value="kilometers">Kilometers</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : null}
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
      {children}
    </h3>
  );
}

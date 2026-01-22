'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { updateBusinessOverrides } from '@/actions/update-business-overrides';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const hoursSchema = z.object({
  weekday_text: z.array(z.string()).optional(),
});

export const businessEditSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Business name must be at least 2 characters.' }),
  website: z
    .url({ message: 'Please enter a valid URL.' })
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || null),
  phone: z
    .string()
    .min(10, { message: 'Please enter a valid phone number.' })
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || null),
  formatted_address: z
    .string()
    .min(5, { message: 'Please enter a valid address.' })
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || null),
  hours: hoursSchema.nullable(),
});

export type BusinessEditFormValues = z.infer<typeof businessEditSchema>;

interface BusinessEditFormProps {
  siteBusinessId: string;
  defaultValues: {
    name: string;
    website: string | null;
    phone: string | null;
    formatted_address: string | null;
    hours: { weekday_text?: string[] } | null;
  };
}

function parseHoursToFields(
  hours: { weekday_text?: string[] } | null
): Record<string, string> {
  const fields: Record<string, string> = {};
  DAYS_OF_WEEK.forEach((day) => {
    fields[day] = '';
  });

  if (!hours?.weekday_text) return fields;

  hours.weekday_text.forEach((entry) => {
    const day = DAYS_OF_WEEK.find((d) => entry.startsWith(d));
    if (day) {
      const hoursText = entry.replace(`${day}: `, '');
      fields[day] = hoursText;
    }
  });

  return fields;
}

function fieldsToHours(
  fields: Record<string, string>
): { weekday_text: string[] } | null {
  const weekdayText: string[] = [];

  DAYS_OF_WEEK.forEach((day) => {
    const value = fields[day]?.trim();
    if (value) {
      weekdayText.push(`${day}: ${value}`);
    }
  });

  return weekdayText.length > 0 ? { weekday_text: weekdayText } : null;
}

export function BusinessEditForm({
  siteBusinessId,
  defaultValues,
}: BusinessEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const initialHoursFields = parseHoursToFields(defaultValues.hours);
  const [hoursFields, setHoursFields] =
    useState<Record<string, string>>(initialHoursFields);

  const form = useForm<BusinessEditFormValues>({
    resolver: zodResolver(businessEditSchema),
    defaultValues: {
      name: defaultValues.name,
      website: defaultValues.website ?? '',
      phone: defaultValues.phone ?? '',
      formatted_address: defaultValues.formatted_address ?? '',
      hours: defaultValues.hours,
    },
  });

  function handleHoursChange(day: string, value: string) {
    const newFields = { ...hoursFields, [day]: value };
    setHoursFields(newFields);
    form.setValue('hours', fieldsToHours(newFields));
  }

  async function onSubmit(values: BusinessEditFormValues) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateBusinessOverrides({
        siteBusinessId,
        overrides: {
          name: values.name,
          website: values.website,
          phone: values.phone,
          formatted_address: values.formatted_address,
          hours: values.hours,
        },
        originalAddress: defaultValues.formatted_address,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSuccess('Business information updated successfully.');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Business update error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter business name"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  disabled={isLoading}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  disabled={isLoading}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="formatted_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="123 Main St, City, State 12345"
                  disabled={isLoading}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Business Hours</h3>
            <p className="text-sm text-muted-foreground">
              Enter hours for each day (e.g., &quot;9:00 AM - 5:00 PM&quot; or
              &quot;Closed&quot;)
            </p>
          </div>
          <div className="grid gap-3">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="flex items-center gap-4">
                <label className="w-24 text-sm font-medium">{day}</label>
                <Input
                  placeholder="9:00 AM - 5:00 PM"
                  value={hoursFields[day]}
                  onChange={(e) => handleHoursChange(day, e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
          <FormDescription>
            Leave blank for days you don&apos;t want to display.
          </FormDescription>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-400">
            {success}
          </div>
        )}
      </form>
    </Form>
  );
}

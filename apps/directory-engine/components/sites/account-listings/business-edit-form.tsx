'use client';

import { useState, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { updateBusinessOverrides } from '@/actions/update-business-overrides';
import { getBusinessImageUrl } from '@/lib/utils';
import { Lock, Upload, X } from 'lucide-react';

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
  // Pro fields
  description: z
    .string()
    .max(500, { message: 'Description must be 500 characters or less.' })
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || null),
});

export type BusinessEditFormValues = z.infer<typeof businessEditSchema>;

interface BusinessEditFormProps {
  siteBusinessId: string;
  siteDomain: string;
  plan: string | null;
  defaultValues: {
    name: string;
    website: string | null;
    phone: string | null;
    formatted_address: string | null;
    hours: { weekday_text?: string[] } | null;
    description: string | null;
    main_photo_name: string | null;
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

// 5MB max file size
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export function BusinessEditForm({
  siteBusinessId,
  siteDomain,
  plan,
  defaultValues,
}: BusinessEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Image state
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(
    null
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [currentImagePath, setCurrentImagePath] = useState(
    defaultValues.main_photo_name
  );
  const imageInputRef = useRef<HTMLInputElement>(null);

  const isPro = Boolean(plan);
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
      description: defaultValues.description ?? '',
    },
  });

  function handleHoursChange(day: string, value: string) {
    const newFields = { ...hoursFields, [day]: value };
    setHoursFields(newFields);
    form.setValue('hours', fieldsToHours(newFields));
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setImageError(
        `File size (${sizeMB}MB) exceeds the ${MAX_IMAGE_SIZE_MB}MB limit. Please choose a smaller image.`
      );
      return;
    }

    // Clear any previous error
    setImageError(null);

    // Store file for later upload
    setPendingImage(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPendingImagePreview(previewUrl);
  }

  function clearPendingImage() {
    if (pendingImagePreview) {
      URL.revokeObjectURL(pendingImagePreview);
    }
    setPendingImage(null);
    setPendingImagePreview(null);
    setImageError(null);
  }

  async function onSubmit(values: BusinessEditFormValues) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Include hasNewImage if user selected a new image and is Pro
      const hasNewImage = isPro && pendingImage !== null;

      const result = await updateBusinessOverrides({
        siteBusinessId,
        updates: {
          name: values.name,
          website: values.website,
          phone: values.phone,
          formatted_address: values.formatted_address,
          hours: values.hours,
          description: isPro ? values.description : null,
        },
        originalAddress: defaultValues.formatted_address,
        hasNewImage,
        siteDomain: hasNewImage ? siteDomain : undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      // If we have an image to upload, do it now
      if (hasNewImage && result.data.imageUploadUrl && pendingImage) {
        const uploadResponse = await fetch(result.data.imageUploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': pendingImage.type },
          body: pendingImage,
        });

        if (!uploadResponse.ok) {
          setError(
            'Business updated, but image upload failed. Please try again.'
          );
          return;
        }

        // Update local state with new image path
        setCurrentImagePath(result.data.imagePath ?? null);
        clearPendingImage();
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

        {/* Pro Fields Section */}
        <div className="border-t pt-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-md font-medium">Pro Features</h3>
            {!isPro && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Upgrade to unlock
              </span>
            )}
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={!isPro ? 'opacity-50' : ''}>
                  Business Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your business, services, and what makes you unique..."
                    disabled={isLoading || !isPro}
                    className={!isPro ? 'opacity-50' : ''}
                    rows={4}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>
                  A custom description that will be displayed on your listing.
                  {!isPro && ' Upgrade to Pro to customize.'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Main Image Upload */}
          <div className="space-y-3 mt-6">
            <Label className={!isPro ? 'opacity-50' : ''}>Main Image</Label>

            <div className="flex items-start gap-4">
              <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-lg border bg-muted">
                {pendingImagePreview ? (
                  <Image
                    src={pendingImagePreview}
                    alt="New image preview"
                    fill
                    sizes="192px"
                    className="object-cover"
                  />
                ) : getBusinessImageUrl(currentImagePath) ? (
                  <Image
                    src={getBusinessImageUrl(currentImagePath)!}
                    alt="Business main image"
                    fill
                    sizes="192px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageSelect}
                  disabled={isLoading || !isPro}
                  className="hidden"
                  id="upload-main-image"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading || !isPro}
                    className={!isPro ? 'opacity-50' : ''}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {currentImagePath || pendingImage
                      ? 'Replace Image'
                      : 'Select Image'}
                  </Button>

                  {pendingImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearPendingImage}
                      disabled={isLoading}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Clear
                    </Button>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {pendingImage
                    ? `Selected: ${pendingImage.name} (will upload on save)`
                    : `Select a custom main image for your listing (max ${MAX_IMAGE_SIZE_MB}MB).`}
                  {!isPro && ' Upgrade to Pro to customize.'}
                </p>

                {imageError && (
                  <p className="flex items-center gap-1 text-sm text-destructive">
                    <X className="h-4 w-4" />
                    {imageError}
                  </p>
                )}
              </div>
            </div>
          </div>
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

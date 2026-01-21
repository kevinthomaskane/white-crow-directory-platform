'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn, validateEmailDomain } from '@/lib/utils';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { submitBusiness } from '@/actions/submit-business';
import Link from 'next/link';

interface CategoryOption {
  id: string;
  name: string;
}

interface CityOption {
  id: string;
  name: string;
}

interface SubmitBusinessFormProps {
  siteId: string;
  categories: CategoryOption[];
  cities: CityOption[];
}

export function SubmitBusinessForm({
  siteId,
  categories,
  cities,
}: SubmitBusinessFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const hasMultipleCategories = categories.length > 1;
  const hasMultipleCities = cities.length > 1;

  const formSchema = z.object({
    businessName: z.string().min(2, {
      message: 'Business name must be at least 2 characters.',
    }),
    businessEmail: z.email({
      message: 'Please enter a valid email address.',
    }),
    businessWebsite: z
      .url({ message: 'Please enter a valid URL.' })
      .or(z.literal('')),
    categoryId: hasMultipleCategories
      ? z.string().min(1, { message: 'Please select a category.' })
      : z.string().optional(),
    cityId: hasMultipleCities
      ? z.string().min(1, { message: 'Please select a city.' })
      : z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: '',
      businessEmail: '',
      businessWebsite: '',
      categoryId: '',
      cityId: '',
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      setError(null);

      const categoryId = hasMultipleCategories
        ? values.categoryId!
        : categories[0]?.id;
      const cityId = hasMultipleCities ? values.cityId! : cities[0]?.id;

      if (!validateEmailDomain(values.businessEmail, values.businessWebsite)) {
        setError(
          'The business email domain must match the business website domain.'
        );
        return;
      }

      const result = await submitBusiness({
        siteId,
        businessName: values.businessName,
        businessEmail: values.businessEmail,
        businessWebsite: values.businessWebsite,
        categoryId,
        cityId,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Submit business error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border bg-muted/50 p-8 text-center">
        <h2 className="text-xl font-semibold">Submission Received</h2>
        <p className="mt-2 text-muted-foreground">
          Thank you for submitting your business. We&apos;ll review your
          submission and send a confirmation email to the address provided.
        </p>
      </div>
    );
  }

  const selectedCategory = categories.find(
    (c) => c.id === form.watch('categoryId')
  );
  const selectedCity = cities.find((c) => c.id === form.watch('cityId'));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your business name"
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
          name="businessEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="contact@yourbusiness.com"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                We&apos;ll send a confirmation email to this address.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="businessWebsite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Website</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://yourbusiness.com"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {hasMultipleCategories && (
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Category</FormLabel>
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={categoryOpen}
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                        disabled={isLoading}
                      >
                        {selectedCategory?.name || 'Select a category...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search categories..." />
                      <CommandList>
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                          {categories.map((category) => (
                            <CommandItem
                              key={category.id}
                              value={category.name}
                              onSelect={() => {
                                field.onChange(category.id);
                                setCategoryOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  field.value === category.id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {category.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  No matching category? Reach out via our{' '}
                  <Link
                    href="/contact"
                    className="text-accent-foreground underline"
                  >
                    contact form.
                  </Link>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {hasMultipleCities && (
          <FormField
            control={form.control}
            name="cityId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>City</FormLabel>
                <Popover open={cityOpen} onOpenChange={setCityOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={cityOpen}
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                        disabled={isLoading}
                      >
                        {selectedCity?.name || 'Select a city...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search cities..." />
                      <CommandList>
                        <CommandEmpty>No city found.</CommandEmpty>
                        <CommandGroup>
                          {cities.map((city) => (
                            <CommandItem
                              key={city.id}
                              value={city.name}
                              onSelect={() => {
                                field.onChange(city.id);
                                setCityOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  field.value === city.id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {city.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Don&apos;t see your city? Reach out via our{' '}
                  <Link
                    href="/contact"
                    className="text-accent-foreground underline"
                  >
                    contact form.
                  </Link>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Business'}
        </Button>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
      </form>
    </Form>
  );
}

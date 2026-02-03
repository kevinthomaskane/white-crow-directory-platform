'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { handleContactForm } from '@/actions/contact';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.email({
    message: 'Please enter a valid email address.',
  }),
  message: z.string().min(10, {
    message: 'Message must be at least 10 characters.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface ContactFormProps {
  siteName: string;
  className?: string;
}

export function ContactForm({ siteName, className }: ContactFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  async function handleSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      setError(null);

      const result = await handleContactForm({
        name: values.name,
        email: values.email,
        message: values.message,
        site: siteName,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Contact form error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border bg-muted/50 p-8 text-center">
        <h2 className="text-xl font-semibold">Message Sent</h2>
        <p className="mt-2 text-muted-foreground">
          Thank you for reaching out. We&apos;ll get back to you as soon as
          possible.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={className}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your name"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
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
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="How can we help you?"
                    rows={5}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Message'}
          </Button>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}

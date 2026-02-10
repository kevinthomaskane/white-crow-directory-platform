'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { handleContactForm } from '@/actions/contact';

interface FeedbackFormProps {
  siteName: string;
  userEmail?: string;
  userName?: string;
  placeholder?: string;
  tag?: string;
}

export function FeedbackForm({
  siteName,
  userEmail,
  userName,
  placeholder = 'What features would you find most valuable in a premium plan?',
  tag = 'Premium Feedback',
}: FeedbackFormProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (message.trim().length < 10) {
      setError('Please enter at least 10 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await handleContactForm({
      name: userName ?? 'Public Feedback',
      email: userEmail ?? 'no-reply@unknown.com',
      message: `[${tag}] ${message}`,
      site: siteName,
    });

    setLoading(false);

    if (result.ok) {
      setSuccess(true);
    } else {
      setError(result.error);
    }
  }

  if (success) {
    return (
      <p className="text-sm text-muted-foreground">
        Thanks for your feedback! We&apos;ll review it shortly.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white">
      <Textarea
        placeholder={placeholder}
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={loading}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" variant="outline" disabled={loading}>
        {loading ? 'Sending…' : 'Submit Feedback'}
      </Button>
    </form>
  );
}

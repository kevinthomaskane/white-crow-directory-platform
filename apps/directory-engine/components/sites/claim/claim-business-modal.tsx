'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { useAuth } from '@/contexts/auth-context';
import {
  initiateBusinessClaim,
  claimBusinessAsUser,
} from '@/actions/claim-business';

interface ClaimBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteBusinessId: string;
  businessName: string;
  businessWebsite: string | null;
}

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export function ClaimBusinessModal({
  isOpen,
  onClose,
  siteBusinessId,
  businessName,
  businessWebsite,
}: ClaimBusinessModalProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
      form.reset();
    }
  }, [isOpen, form]);

  // Get website domain for display
  const getWebsiteDomain = () => {
    if (!businessWebsite) return null;
    try {
      return new URL(businessWebsite).hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  };

  const websiteDomain = getWebsiteDomain();
  const isAuthenticated = !!user;
  const userEmail = user?.email ?? null;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      setError(null);

      if (isAuthenticated) {
        // User is logged in - claim directly
        const result = await claimBusinessAsUser({ siteBusinessId });

        if (!result.ok) {
          setError(result.error);
          return;
        }

        setSuccess(true);
        // Refresh the page to show claimed status
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        // User is not logged in - send magic link
        const redirectUrl = `${window.location.origin}/claim/verify`;
        const result = await initiateBusinessClaim({
          siteBusinessId,
          email: values.email,
          redirectUrl,
        });

        if (!result.ok) {
          setError(result.error);
          return;
        }

        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Claim error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Loading state while checking auth
  if (isAuthLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // No website - show contact message
  if (!businessWebsite) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Claim {businessName}</DialogTitle>
            <DialogDescription>
              We verify business ownership via email
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-800">
                    No website on file
                  </p>
                  <p className="text-sm text-amber-700">
                    This business doesn&apos;t have a website in our records. To
                    claim it, please contact our verification team.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                Our team will verify your business ownership through alternative
                methods such as business documentation or phone verification.
              </p>
            </div>

            <Button variant="outline" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Success state - email sent
  if (success && !isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Check your email</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-800">
                    Verification email sent
                  </p>
                  <p className="text-sm text-green-700">
                    We&apos;ve sent a verification link to{' '}
                    <strong>{form.getValues('email')}</strong>. Click the link
                    to complete your claim.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              The link will expire in 24 hours. If you don&apos;t see the email,
              check your spam folder.
            </p>

            <Button variant="outline" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Success state - claimed (authenticated user)
  if (success && isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Business claimed!</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-800">
                    Successfully claimed
                  </p>
                  <p className="text-sm text-green-700">
                    You now have control of {businessName}. Refreshing...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Authenticated user - show simplified claim
  if (isAuthenticated) {
    const emailMatchesDomain =
      userEmail && websiteDomain
        ? userEmail.split('@')[1]?.toLowerCase() === websiteDomain.toLowerCase()
        : false;

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Claim {businessName}</DialogTitle>
            <DialogDescription>
              Verify you own this business
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {emailMatchesDomain ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Your account email ({userEmail}) matches the business website
                  domain ({websiteDomain}). Click below to claim this business.
                </p>

                <Button
                  className="w-full"
                  onClick={() => onSubmit({ email: userEmail! })}
                  disabled={isLoading}
                >
                  {isLoading ? 'Claiming...' : 'Claim This Business'}
                </Button>
              </>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-800">
                      Email domain mismatch
                    </p>
                    <p className="text-sm text-amber-700">
                      Your account email ({userEmail}) doesn&apos;t match the
                      business website domain ({websiteDomain}). You need an
                      email address ending in @{websiteDomain} to claim this
                      business.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Don&apos;t have access to a business email? Contact our
              verification team.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Default - email form for unauthenticated users
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Claim {businessName}</DialogTitle>
          <DialogDescription>
            Verify your business ownership via email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex gap-3">
              <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">How verification works</p>
                <p className="text-sm text-muted-foreground">
                  We verify business ownership by sending a confirmation email
                  to an address matching your business website domain (e.g.,
                  you@{websiteDomain}).
                </p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={`you@${websiteDomain}`}
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Verification Email'}
              </Button>

              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}
            </form>
          </Form>

          <p className="text-xs text-muted-foreground">
            Don&apos;t have access to a business email? Contact our verification
            team.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

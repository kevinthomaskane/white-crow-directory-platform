'use client';

import { useState } from 'react';
import { CheckCircle2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ClaimBusinessModal } from '@/components/sites/claim/claim-business-modal';

interface ClaimBusinessBannerProps {
  className?: string;
  siteBusinessId: string;
  businessName: string;
  businessWebsite: string | null;
}

export function ClaimBusinessBanner({
  className,
  siteBusinessId,
  businessName,
  businessWebsite,
}: ClaimBusinessBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const benefits = [
    {
      icon: CheckCircle2,
      text: 'Update business hours, photos, and contact info',
    },
    {
      icon: TrendingUp,
      text: 'Boost visibility in search results',
    },
  ];

  return (
    <>
      <section
        className={cn(
          'rounded-lg border-2 border-primary/20 bg-primary/5 p-6 sm:p-8',
          className
        )}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Is this your business?</h2>
              <p className="text-muted-foreground mt-1">
                Claim your free listing to update information and connect with
                more customers
              </p>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <benefit.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{benefit.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-shrink-0">
            <Button
              size="xl"
              className="w-full lg:w-auto"
              onClick={() => setIsModalOpen(true)}
            >
              Claim This Business - It&apos;s Free
            </Button>
          </div>
        </div>
      </section>

      <ClaimBusinessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        siteBusinessId={siteBusinessId}
        businessName={businessName}
        businessWebsite={businessWebsite}
      />
    </>
  );
}

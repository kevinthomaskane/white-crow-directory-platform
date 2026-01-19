'use client';

import { useState, type ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { ClaimBusinessModal } from './claim-business-modal';

interface ClaimBusinessButtonProps
  extends Omit<ComponentProps<typeof Button>, 'onClick'> {
  siteBusinessId: string;
  businessName: string;
  businessWebsite: string | null;
}

export function ClaimBusinessButton({
  siteBusinessId,
  businessName,
  businessWebsite,
  children,
  ...buttonProps
}: ClaimBusinessButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} {...buttonProps}>
        {children}
      </Button>

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

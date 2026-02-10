'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createBillingPortalSession } from '@/actions/billing';

interface ManageSubscriptionButtonProps {
  siteBusinessId: string;
}

export function ManageSubscriptionButton({
  siteBusinessId,
}: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await createBillingPortalSession({ siteBusinessId });

    if (result.ok) {
      window.location.href = result.data.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={loading}>
      {loading ? 'Loading…' : 'Manage Subscription'}
    </Button>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createCheckoutSession } from '@/actions/billing';

interface UpgradePlanButtonProps {
  siteBusinessId: string;
}

export function UpgradePlanButton({ siteBusinessId }: UpgradePlanButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await createCheckoutSession({ siteBusinessId });

    if (result.ok) {
      window.location.href = result.data.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={loading}>
      {loading ? 'Loading…' : 'Upgrade to Premium'}
    </Button>
  );
}

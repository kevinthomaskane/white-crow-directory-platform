'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BadgeEmblem } from '@/components/sites/badge-emblem';

interface BadgeEmbedSectionProps {
  siteBusinessId: string;
  siteDomain: string;
  siteName: string;
  businessUrl: string;
}

export function BadgeEmbedSection({
  siteBusinessId,
  siteDomain,
  siteName,
  businessUrl,
}: BadgeEmbedSectionProps) {
  const [copied, setCopied] = useState(false);

  const badgeUrl = `https://${siteDomain}/api/badge/${siteBusinessId}`;
  const fullBusinessUrl = `https://${siteDomain}${businessUrl}`;

  const embedCode = `<a href="${fullBusinessUrl}" target="_blank">
  <img src="${badgeUrl}" alt="Premium Member - ${siteName}" width="200" height="240" />
</a>`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-medium mb-2">Premium Member Badge</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Display this badge on your website to showcase your premium membership
        and build trust with potential customers.
      </p>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Badge Preview */}
        <div className="flex flex-col items-center">
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6">
            <BadgeEmblem directoryName={siteName.toUpperCase()} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Badge Preview</p>
        </div>

        {/* Embed Code & Instructions */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Embed Code</label>
            <div className="mt-2 relative">
              <pre className="rounded-lg bg-muted p-4 text-xs overflow-x-auto whitespace-pre-wrap break-all font-mono">
                {embedCode}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">How to use</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Copy the embed code above</li>
              <li>Paste it into your website&apos;s HTML</li>
              <li>The badge will link back to our directory</li>
            </ol>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-medium mb-2">Benefits</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>
                  Build trust by showcasing your verified premium status
                </span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Boost SEO with a dofollow backlink to your listing</span>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>
                  Drive traffic from your site to your directory profile
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

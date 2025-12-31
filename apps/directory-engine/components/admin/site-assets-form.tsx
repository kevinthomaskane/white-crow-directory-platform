'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  getSiteAssetUploadUrl,
  saveSiteAssetPath,
} from '@/actions/upload-site-asset';
import type { SiteAssetType } from '@/lib/types';

interface AssetUploadProps {
  siteId: string;
  siteDomain: string;
  assetType: SiteAssetType;
  label: string;
  accept: string;
  currentPath: string | null;
}

function AssetUpload({
  siteId,
  siteDomain,
  assetType,
  label,
  accept,
  currentPath,
}: AssetUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [assetPath, setAssetPath] = useState(currentPath);
  const inputRef = useRef<HTMLInputElement>(null);

  const imageUrl = assetPath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${assetPath}`
    : null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await getSiteAssetUploadUrl(siteDomain, assetType);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const response = await fetch(result.data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!response.ok) {
        setError('Upload failed. Please try again.');
        return;
      }

      // Save the path to the database
      const saveResult = await saveSiteAssetPath(
        siteId,
        assetType,
        result.data.path
      );

      if (!saveResult.ok) {
        setError(saveResult.error);
        return;
      }

      setAssetPath(result.data.path);
      setSuccess(true);
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      <div className="flex items-start gap-4">
        <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg border bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={label}
              fill
              sizes="160px"
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
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
            id={`upload-${assetType}`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {assetPath ? 'Replace' : 'Upload'}
              </>
            )}
          </Button>

          {error && (
            <p className="flex items-center gap-1 text-sm text-destructive">
              <X className="h-4 w-4" />
              {error}
            </p>
          )}

          {success && (
            <p className="flex items-center gap-1 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Uploaded successfully
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface SiteAssetsFormProps {
  siteId: string;
  siteDomain: string;
  currentHeroPath: string | null;
  currentLogoPath: string | null;
  currentFaviconPath: string | null;
}

export function SiteAssetsForm({
  siteId,
  siteDomain,
  currentHeroPath,
  currentLogoPath,
  currentFaviconPath,
}: SiteAssetsFormProps) {
  return (
    <div className="space-y-6">
      <AssetUpload
        siteId={siteId}
        siteDomain={siteDomain}
        assetType="hero"
        label="Hero Image"
        accept="image/jpeg,image/png,image/webp"
        currentPath={currentHeroPath}
      />

      <AssetUpload
        siteId={siteId}
        siteDomain={siteDomain}
        assetType="logo"
        label="Logo"
        accept="image/png,image/svg+xml,image/webp"
        currentPath={currentLogoPath}
      />

      <AssetUpload
        siteId={siteId}
        siteDomain={siteDomain}
        assetType="favicon"
        label="Favicon"
        accept="image/png,image/x-icon,image/svg+xml"
        currentPath={currentFaviconPath}
      />
    </div>
  );
}

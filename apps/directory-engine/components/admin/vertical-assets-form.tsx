'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  getVerticalAssetUploadUrl,
  saveVerticalHeroUrl,
} from '@/actions/upload-vertical-asset';
import type { VerticalAssetType } from '@/lib/types';

interface HeroUploadProps {
  verticalId: string;
  verticalSlug: string;
  currentUrl: string | null;
}

function HeroUpload({ verticalId, verticalSlug, currentUrl }: HeroUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await getVerticalAssetUploadUrl(verticalSlug, 'hero');

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

      // Save the new URL to the database
      const saveResult = await saveVerticalHeroUrl(verticalId, result.data.publicUrl);

      if (!saveResult.ok) {
        setError(saveResult.error);
        return;
      }

      setImageUrl(result.data.publicUrl);
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
      <Label>Hero Image</Label>

      <div className="flex items-start gap-4">
        <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg border bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Hero"
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
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
            id="upload-hero"
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
                {imageUrl ? 'Replace' : 'Upload'}
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

interface AssetUploadProps {
  verticalSlug: string;
  assetType: VerticalAssetType;
  label: string;
  accept: string;
}

function AssetUpload({
  verticalSlug,
  assetType,
  label,
  accept,
}: AssetUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await getVerticalAssetUploadUrl(verticalSlug, assetType);

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

      setImageUrl(result.data.publicUrl);
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
                {imageUrl ? 'Replace' : 'Upload'}
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

interface VerticalAssetsFormProps {
  verticalId: string;
  verticalSlug: string;
  currentHeroUrl: string | null;
}

export function VerticalAssetsForm({
  verticalId,
  verticalSlug,
  currentHeroUrl,
}: VerticalAssetsFormProps) {
  return (
    <div className="space-y-6">
      <HeroUpload
        verticalId={verticalId}
        verticalSlug={verticalSlug}
        currentUrl={currentHeroUrl}
      />

      <AssetUpload
        verticalSlug={verticalSlug}
        assetType="logo"
        label="Logo"
        accept="image/png,image/svg+xml,image/webp"
      />
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateBusinessPremiumFields } from '@/actions/update-business-premium-fields';
import { getBusinessImageUrl } from '@/lib/utils';
import { Lock, Upload, Loader2, X, Check } from 'lucide-react';

// 5MB max file size
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

interface BusinessPremiumSectionProps {
  siteBusinessId: string;
  siteDomain: string;
  plan: string | null;
  initialDescription: string | null;
  initialMainPhoto: string | null;
}

export function BusinessPremiumSection({
  siteBusinessId,
  siteDomain,
  plan,
  initialDescription,
  initialMainPhoto,
}: BusinessPremiumSectionProps) {
  const [description, setDescription] = useState(initialDescription ?? '');
  const [currentImagePath, setCurrentImagePath] = useState(initialMainPhoto);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const isPremium = Boolean(plan);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setImageError(
        `File size (${sizeMB}MB) exceeds the ${MAX_IMAGE_SIZE_MB}MB limit.`
      );
      return;
    }

    setImageError(null);
    setPendingImage(file);
    const previewUrl = URL.createObjectURL(file);
    setPendingImagePreview(previewUrl);
  }

  function clearPendingImage() {
    if (pendingImagePreview) {
      URL.revokeObjectURL(pendingImagePreview);
    }
    setPendingImage(null);
    setPendingImagePreview(null);
    setImageError(null);
  }

  async function handleSave() {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const hasNewImage = pendingImage !== null;

      const result = await updateBusinessPremiumFields({
        siteBusinessId,
        description: description || null,
        hasNewImage,
        siteDomain: hasNewImage ? siteDomain : undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      // Upload image if we have one
      if (hasNewImage && result.data.imageUploadUrl && pendingImage) {
        const uploadResponse = await fetch(result.data.imageUploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': pendingImage.type },
          body: pendingImage,
        });

        if (!uploadResponse.ok) {
          setError(
            'Settings saved, but image upload failed. Please try again.'
          );
          return;
        }

        setCurrentImagePath(result.data.imagePath ?? null);
        clearPendingImage();
      }

      setSuccess('Pro settings saved successfully.');
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-lg font-medium">Premium Options</h2>
        {!isPremium && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            Upgrade to unlock
          </span>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2 mb-6">
        <Label className={!isPremium ? 'opacity-50' : ''}>
          Business Description
        </Label>
        <Textarea
          placeholder="Describe your business, services, and what makes you unique..."
          disabled={isLoading || !isPremium}
          className={!isPremium ? 'opacity-50' : ''}
          rows={4}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          A custom description displayed on your listing (max 500 characters).
          {!isPremium && ' Upgrade to Pro to customize.'}
        </p>
      </div>

      {/* Main Image */}
      <div className="space-y-3 mb-6">
        <Label className={!isPremium ? 'opacity-50' : ''}>Main Image</Label>

        <div className="flex items-start gap-4">
          <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-lg border bg-muted">
            {pendingImagePreview ? (
              <Image
                src={pendingImagePreview}
                alt="New image preview"
                fill
                sizes="192px"
                className="object-cover"
              />
            ) : getBusinessImageUrl(currentImagePath) ? (
              <Image
                src={getBusinessImageUrl(currentImagePath)!}
                alt="Business main image"
                fill
                sizes="192px"
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
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              disabled={isLoading || !isPremium}
              className="hidden"
              id="upload-main-image"
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoading || !isPremium}
                className={!isPremium ? 'opacity-50' : ''}
                onClick={() => imageInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {currentImagePath || pendingImage
                  ? 'Replace Image'
                  : 'Select Image'}
              </Button>

              {pendingImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearPendingImage}
                  disabled={isLoading}
                >
                  <X className="mr-1 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {pendingImage
                ? `Selected: ${pendingImage.name} (will upload on save)`
                : `Select a custom main image for your listing (max ${MAX_IMAGE_SIZE_MB}MB).`}
              {!isPremium && ' Upgrade to Pro to customize.'}
            </p>

            {imageError && (
              <p className="flex items-center gap-1 text-sm text-destructive">
                <X className="h-4 w-4" />
                {imageError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={isLoading || !isPremium}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Pro Settings'
        )}
      </Button>

      {/* Messages */}
      {error && (
        <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}
    </div>
  );
}

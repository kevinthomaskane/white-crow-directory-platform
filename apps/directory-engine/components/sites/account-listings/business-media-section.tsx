'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getBusinessMediaUploadUrl,
  saveBusinessMedia,
  deleteBusinessMedia,
  saveBusinessVideo,
  deleteBusinessVideo,
  type BusinessMediaItem,
  type BusinessVideoItem,
} from '@/actions/business-media';
import { getBusinessImageUrl, getVideoThumbnailUrl } from '@/lib/utils';
import { Lock, Upload, Trash2, Loader2, X, Check, Video, Play } from 'lucide-react';

// 5MB max file size
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

interface BusinessMediaSectionProps {
  siteBusinessId: string;
  siteDomain: string;
  plan: string | null;
  initialMedia: BusinessMediaItem[];
  initialVideo: BusinessVideoItem | null;
}

export function BusinessMediaSection({
  siteBusinessId,
  siteDomain,
  plan,
  initialMedia,
  initialVideo,
}: BusinessMediaSectionProps) {
  const [media, setMedia] = useState<BusinessMediaItem[]>(initialMedia);
  const [video, setVideo] = useState<BusinessVideoItem | null>(initialVideo);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingVideo, setIsSavingVideo] = useState(false);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPro = Boolean(plan);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setError(
        `File size (${sizeMB}MB) exceeds the ${MAX_IMAGE_SIZE_MB}MB limit.`
      );
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Get signed upload URL
      const urlResult = await getBusinessMediaUploadUrl(siteBusinessId, siteDomain);

      if (!urlResult.ok) {
        setError(urlResult.error);
        return;
      }

      // Upload file to storage
      const uploadResponse = await fetch(urlResult.data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        setError('Upload failed. Please try again.');
        return;
      }

      // Save the media record
      const saveResult = await saveBusinessMedia(siteBusinessId, urlResult.data.path);

      if (!saveResult.ok) {
        setError(saveResult.error);
        return;
      }

      // Add to local state
      setMedia((prev) => [
        ...prev,
        {
          id: saveResult.data.mediaId,
          file_path: urlResult.data.path,
          alt_text: null,
          sort_order: prev.length,
        },
      ]);

      setSuccess('Image uploaded successfully.');
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(mediaId: string) {
    setDeletingId(mediaId);
    setError(null);
    setSuccess(null);

    try {
      const result = await deleteBusinessMedia(mediaId, siteBusinessId);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      // Remove from local state
      setMedia((prev) => prev.filter((m) => m.id !== mediaId));
      setSuccess('Image deleted.');
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSaveVideo() {
    if (!videoUrl.trim()) {
      setError('Please enter a video URL.');
      return;
    }

    setIsSavingVideo(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await saveBusinessVideo(siteBusinessId, videoUrl.trim());

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setVideo({ id: result.data.videoId, embed_url: videoUrl.trim() });
      setVideoUrl('');
      setSuccess('Video added successfully.');
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsSavingVideo(false);
    }
  }

  async function handleDeleteVideo() {
    setIsDeletingVideo(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await deleteBusinessVideo(siteBusinessId);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setVideo(null);
      setSuccess('Video removed.');
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsDeletingVideo(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-lg font-medium">Business Media</h2>
        {!isPro && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            Upgrade to unlock
          </span>
        )}
      </div>

      <p className={`text-sm text-muted-foreground mb-4 ${!isPro ? 'opacity-50' : ''}`}>
        Add additional images to showcase your business.
        {!isPro && ' Upgrade to Pro to add gallery images.'}
      </p>

      {/* Image grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {media.map((item) => (
            <div
              key={item.id}
              className={`relative group aspect-video overflow-hidden rounded-lg border bg-muted ${!isPro ? 'opacity-50' : ''}`}
            >
              <Image
                src={getBusinessImageUrl(item.file_path)!}
                alt={item.alt_text ?? 'Business image'}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                className="object-cover"
              />
              {isPro && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {media.length === 0 && (
        <div className={`rounded-lg border-2 border-dashed p-8 text-center mb-4 ${!isPro ? 'opacity-50' : ''}`}>
          <p className="text-sm text-muted-foreground">
            No gallery images yet.
          </p>
        </div>
      )}

      {/* Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        disabled={isUploading || !isPro}
        className="hidden"
        id="upload-gallery-image"
      />
      <Button
        type="button"
        variant="outline"
        disabled={isUploading || !isPro}
        className={!isPro ? 'opacity-50' : ''}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Add Image
          </>
        )}
      </Button>

      {/* Video Embed Section */}
      <div className="border-t pt-6 mt-6">
        <Label className={`text-base font-medium ${!isPro ? 'opacity-50' : ''}`}>
          Video Embed
        </Label>
        <p className={`text-sm text-muted-foreground mt-1 mb-4 ${!isPro ? 'opacity-50' : ''}`}>
          Add a YouTube or Vimeo video to your listing.
          {!isPro && ' Upgrade to Pro to add videos.'}
        </p>

        {video ? (
          <div className={`space-y-3 ${!isPro ? 'opacity-50' : ''}`}>
            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border bg-muted">
              {getVideoThumbnailUrl(video.embed_url) ? (
                <>
                  <Image
                    src={getVideoThumbnailUrl(video.embed_url)!}
                    alt="Video thumbnail"
                    fill
                    sizes="448px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-black/60 p-3">
                      <Play className="h-8 w-8 text-white" fill="white" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Video className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate max-w-md">
              {video.embed_url}
            </p>
            {isPro && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDeleteVideo}
                disabled={isDeletingVideo}
              >
                {isDeletingVideo ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Remove Video
              </Button>
            )}
          </div>
        ) : (
          <div className={`flex gap-2 max-w-md ${!isPro ? 'opacity-50' : ''}`}>
            <Input
              type="url"
              placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={isSavingVideo || !isPro}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleSaveVideo}
              disabled={isSavingVideo || !isPro || !videoUrl.trim()}
            >
              {isSavingVideo ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Add'
              )}
            </Button>
          </div>
        )}
      </div>

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

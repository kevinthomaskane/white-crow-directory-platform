'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, X } from 'lucide-react';
import {
  cn,
  getBusinessImageUrl,
  getVideoThumbnailUrl,
  getVideoEmbedUrl,
} from '@/lib/utils';
import type { MediaItem } from '@/lib/types';

interface BusinessMediaGalleryProps {
  media: MediaItem[];
  businessName: string;
  className?: string;
}

export function BusinessMediaGallery({
  media,
  businessName,
  className,
}: BusinessMediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Sort by sort_order and filter out items without a file_path or embed_url
  const sortedMedia = [...media]
    .filter((item) => item.file_path || item.embed_url)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (sortedMedia.length === 0) {
    return null;
  }

  const getThumbnailSrc = (item: MediaItem): string | null => {
    if (item.file_path) {
      return getBusinessImageUrl(item.file_path, { width: 400 });
    }
    if (item.embed_url) {
      return getVideoThumbnailUrl(item.embed_url);
    }
    return null;
  };

  const isVideo = (item: MediaItem): boolean => {
    return item.type === 'video' || !!item.embed_url;
  };

  return (
    <>
      <div
        className={cn(
          'flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent',
          className
        )}
      >
        {sortedMedia.map((item, index) => {
          const thumbnailSrc = getThumbnailSrc(item);
          const altText = item.alt_text || `${businessName} media ${index + 1}`;

          return (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedMedia(item)}
              className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-muted transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {thumbnailSrc ? (
                <Image
                  src={thumbnailSrc}
                  alt={altText}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              {/* Video indicator overlay */}
              {isVideo(item) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="h-8 w-8 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedMedia(null)}
            className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative max-w-full w-[600px]"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.embed_url ? (
              <div className="aspect-video w-full">
                <iframe
                  src={
                    getVideoEmbedUrl(selectedMedia.embed_url) ??
                    selectedMedia.embed_url
                  }
                  className="h-full w-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : selectedMedia.file_path ? (
              <Image
                src={
                  getBusinessImageUrl(selectedMedia.file_path, { width: 1600 })!
                }
                alt={selectedMedia.alt_text || businessName}
                width={1200}
                height={800}
                className="w-full max-h-[90vh] rounded-lg object-contain"
              />
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}

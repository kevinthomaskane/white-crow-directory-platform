'use client';

import { useState } from 'react';
import {
  Phone,
  Globe,
  MapPin,
  Clock,
  ExternalLink,
  Navigation,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { BusinessDetailData } from '@/lib/types';

type BusinessContactCardProps = Pick<
  BusinessDetailData,
  'phone' | 'website' | 'latitude' | 'longitude' | 'hours' | 'plan'
> & {
  className?: string;
  formattedAddress: BusinessDetailData['formatted_address'];
};

const DAY_ORDER = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function BusinessContactCard({
  plan,
  phone,
  website,
  formattedAddress,
  latitude,
  longitude,
  hours,
  className,
}: BusinessContactCardProps) {
  const [showAllHours, setShowAllHours] = useState(false);
  const weekdayText = hours ?? [];

  const today = new Date().getDay();
  const todayName = DAY_ORDER[today];
  const todayHours = weekdayText.find((h) => h.startsWith(todayName));

  const directionsUrl =
    latitude && longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      : formattedAddress
        ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(formattedAddress)}`
        : null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Quick Actions */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        {phone && (
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href={`tel:${phone}`}>
              <Phone className="h-4 w-4" />
              <span>Call {phone}</span>
            </a>
          </Button>
        )}

        {website && (
          <Button variant="outline" className="w-full justify-start" asChild>
            <a
              href={website}
              target="_blank"
              rel={cn(!plan && 'nofollow', 'noopener')}
            >
              <Globe className="h-4 w-4" />
              <span className="truncate">{formatWebsiteDisplay(website)}</span>
              <ExternalLink className="h-3 w-3 ml-auto" />
            </a>
          </Button>
        )}

        {directionsUrl && (
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="h-4 w-4" />
              <span>Get Directions</span>
              <ExternalLink className="h-3 w-3 ml-auto" />
            </a>
          </Button>
        )}
      </div>

      {/* Contact Details */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h3 className="font-semibold">Contact Information</h3>

        {formattedAddress && (
          <div className="flex gap-3 text-sm">
            <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
            <span>{formattedAddress}</span>
          </div>
        )}

        {phone && (
          <div className="flex gap-3 text-sm">
            <Phone className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <a href={`tel:${phone}`} className="text-primary hover:underline">
              {phone}
            </a>
          </div>
        )}

        {website && (
          <div className="flex gap-3 text-sm">
            <Globe className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <a
              href={website}
              target="_blank"
              rel={cn(!plan && 'nofollow', 'noopener')}
              className="text-primary hover:underline truncate"
            >
              {formatWebsiteDisplay(website)}
            </a>
          </div>
        )}
      </div>

      {/* Hours */}
      {weekdayText.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Hours
          </h3>

          {/* Today's hours highlighted */}
          {todayHours && (
            <div className="flex justify-between text-sm bg-muted/50 rounded px-3 py-2">
              <span className="font-medium">Today</span>
              <span>{todayHours.split(': ')[1] ?? todayHours}</span>
            </div>
          )}

          {/* Full hours list */}
          {showAllHours && (
            <div className="space-y-2 text-sm">
              {weekdayText.map((dayHours, index) => {
                const [day, time] = dayHours.split(': ');
                const isToday = day === todayName;
                return (
                  <div
                    key={index}
                    className={cn(
                      'flex justify-between',
                      isToday && 'font-medium'
                    )}
                  >
                    <span>{day}</span>
                    <span className="text-muted-foreground">{time}</span>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setShowAllHours(!showAllHours)}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            {showAllHours ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                See all hours
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function formatWebsiteDisplay(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

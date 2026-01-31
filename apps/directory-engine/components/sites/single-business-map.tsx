'use client';

import { useCallback, useRef } from 'react';
import Map, { Marker, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface SingleBusinessMapProps {
  latitude: number;
  longitude: number;
  mapboxToken: string;
}

export function SingleBusinessMap({
  latitude,
  longitude,
  mapboxToken,
}: SingleBusinessMapProps) {
  const mapRef = useRef<MapRef>(null);

  const handleMarkerClick = useCallback(() => {
    // Open Google Maps directions in new tab
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
      '_blank'
    );
  }, [latitude, longitude]);

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude,
          latitude,
          zoom: 14,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <Marker
          longitude={longitude}
          latitude={latitude}
          anchor="bottom"
          onClick={handleMarkerClick}
          color="red"
        />
      </Map>

      {/* Click hint overlay */}
      <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium shadow-sm pointer-events-none">
        Click pin for directions
      </div>
    </div>
  );
}
